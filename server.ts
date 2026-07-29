import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { randomUUID, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { execFile } from "child_process";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.db";
}

const prisma = new PrismaClient();

// Safety net: Express 4 does not forward rejected promises from async route
// handlers, so an unhandled rejection would otherwise terminate the process
// (fatal since Node 15) and take the whole server down for every user. Log and
// keep serving instead of crashing.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

// The generated Prisma client only knows about the models that existed the last
// time `prisma generate` ran. Session / TaskDependency / CustomField (and the
// new User.color, WorkItem.isMilestone/customFields columns) only appear after
// the schema is pushed, so reach them through this untyped alias — same trick
// already used for `prisma.course` above.
const db = prisma as any;

// ---------------------------------------------------------------------------
// Auth helpers (no auth library on purpose — the app has to stay light)
// ---------------------------------------------------------------------------

const SESSION_COOKIE = "maxagile_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Palette used to give each account a distinct avatar colour.
const USER_COLORS = [
  "#F3A733", "#009688", "#3B82F6", "#EC4899", "#8B5CF6",
  "#EF4444", "#10B981", "#F59E0B", "#06B6D4", "#6366F1",
];

/** Cookies come in as one header string; parse it by hand (no cookie-parser). */
function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    if (!key) continue;
    const raw = part.slice(eq + 1).trim();
    try {
      out[key] = decodeURIComponent(raw);
    } catch {
      out[key] = raw;
    }
  }
  return out;
}

/** "<saltHex>:<hashHex>" using Node's built-in scrypt. */
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16);
    scrypt(password, salt, 64, (err, derived) => {
      if (err) return reject(err);
      resolve(`${salt.toString("hex")}:${derived.toString("hex")}`);
    });
  });
}

/** Constant-time comparison; never throws, just answers false on malformed input. */
function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!stored || typeof stored !== "string" || !stored.includes(":")) return resolve(false);
    const [saltHex, hashHex] = stored.split(":");
    const salt = Buffer.from(saltHex || "", "hex");
    const expected = Buffer.from(hashHex || "", "hex");
    if (salt.length === 0 || expected.length === 0) return resolve(false);
    scrypt(password, salt, expected.length, (err, derived) => {
      if (err) return resolve(false);
      try {
        resolve(timingSafeEqual(derived, expected));
      } catch {
        resolve(false);
      }
    });
  });
}

/** Strip the password hash before anything leaves the process. */
function publicUser(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    color: user.color || "#F3A733",
    role: user.role,
  };
}

function setSessionCookie(res: any, token: string) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}`
  );
}

function clearSessionCookie(res: any) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await db.session.create({ data: { userId, token, expiresAt } });
  return token;
}

/** Resolve the signed-in user from the session cookie, or null. */
async function getUserFromRequest(req: any) {
  const token = parseCookies(req.headers?.cookie)[SESSION_COOKIE];
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token }, include: { user: true } });
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    // Opportunistic housekeeping: sweep every stale row while we are here so
    // the table cannot grow without bound on a long-lived install.
    await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return null;
  }
  return session.user;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '80mb' }));

  // Static uploads (registered before vite middleware / dist static)
  const uploadsDir = path.join(process.cwd(), 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
  // Terminate unmatched /uploads/* here. Without this the request falls through
  // to the SPA catch-all, which answers a missing attachment with index.html —
  // so a <iframe>/<img> pointing at a deleted file renders the whole app inside
  // the course page instead of failing.
  app.use('/uploads', (req, res) => {
    res.status(404).json({ error: "File not found" });
  });

  // -------------------------------------------------------------------------
  // Auth gate — sits in front of every /api route below it.
  // -------------------------------------------------------------------------
  app.use(async (req, res, next) => {
    try {
      if (!req.path.startsWith("/api/")) return next();

      const user = await getUserFromRequest(req);
      if (user) (req as any).user = user;

      // Always reachable: the health probe and the auth endpoints themselves
      // (otherwise nobody could ever log in).
      if (req.path === "/api/health" || req.path.startsWith("/api/auth/")) return next();
      if (user) return next();

      // Bootstrap mode: a brand new install has no accounts yet, so there is
      // nobody who *could* be signed in. Locking the API here would lock the
      // owner out of their own data before they ever create an account.
      const userCount = await prisma.user.count();
      if (userCount === 0) return next();

      return res.status(401).json({ error: "unauthorized" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Auth check failed" });
    }
  });

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, name, password, color } = req.body || {};
      if (!username || !name || !password) {
        return res.status(400).json({ error: "username, name and password are required" });
      }
      const cleanUsername = String(username).trim().toLowerCase();
      if (!cleanUsername) return res.status(400).json({ error: "username, name and password are required" });

      const existing = await prisma.user.findUnique({ where: { username: cleanUsername } });
      if (existing) return res.status(409).json({ error: "Username already taken" });

      // First account on a fresh install owns the place.
      const userCount = await prisma.user.count();
      const hashed = await hashPassword(String(password));
      const user = await db.user.create({
        data: {
          username: cleanUsername,
          name: String(name),
          password: hashed,
          role: userCount === 0 ? "ADMIN" : "USER",
          color: color || USER_COLORS[userCount % USER_COLORS.length],
        },
      });

      const token = await createSession(user.id);
      setSessionCookie(res, token);
      res.status(201).json({ user: publicUser(user) });
    } catch (error) {
      // A racing double-submit trips the unique index rather than the check above.
      if ((error as any)?.code === "P2002") return res.status(409).json({ error: "Username already taken" });
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) return res.status(401).json({ error: "Invalid credentials" });

      const user = await prisma.user.findUnique({
        where: { username: String(username).trim().toLowerCase() },
      });
      // Same generic answer for unknown user and wrong password — do not leak
      // which usernames exist.
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const ok = await verifyPassword(String(password), user.password);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });

      const token = await createSession(user.id);
      setSessionCookie(res, token);
      res.json({ user: publicUser(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const token = parseCookies(req.headers?.cookie)[SESSION_COOKIE];
      if (token) await db.session.deleteMany({ where: { token } });
      clearSessionCookie(res);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      // Still clear the cookie: the client should end up signed out regardless.
      clearSessionCookie(res);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userCount = await prisma.user.count();
      // Empty user table => first run. Answer 200 so the UI can show the
      // "create your account" screen instead of a login wall.
      if (userCount === 0) return res.json({ needsSetup: true, user: null });

      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "unauthorized" });
      res.json({ user: publicUser(user) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get current user" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await db.user.findMany({
        select: { id: true, username: true, name: true, color: true, role: true },
        orderBy: { name: "asc" },
      });
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // API Routes
  app.get("/api/health", async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok", db: "connected" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Database connection failed" });
    }
  });

  // Workspaces
  app.get("/api/workspaces", async (req, res) => {
    const workspaces = await prisma.workspace.findMany();
    res.json(workspaces);
  });

  app.post("/api/workspaces", async (req, res) => {
    const { name, description, type } = req.body;
    const workspace = await prisma.workspace.create({
      data: { name, description, type },
    });
    
    // Default statuses
    let statusesToCreate = [
      { workspaceId: workspace.id, name: "Akan Dilakukan", order: 1, color: "#cbd5e1" },
      { workspaceId: workspace.id, name: "Sedang Dikerjakan", order: 2, color: "#93c5fd" },
      { workspaceId: workspace.id, name: "Selesai", order: 3, color: "#86efac" }
    ];

    let tasksToCreate: {title: string, desc: string, priority: string, statusIndex: number}[] = [];

    if (type === "Pengajar" || type === "Pendidikan") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Perencanaan", order: 1, color: "#cbd5e1" },
        { workspaceId: workspace.id, name: "Sedang Mengajar", order: 2, color: "#93c5fd" },
        { workspaceId: workspace.id, name: "Evaluasi", order: 3, color: "#86efac" }
      ];
      tasksToCreate = [
        { title: "Siapkan materi matematika", desc: "Bab 3 Persamaan Linear", priority: "Tinggi", statusIndex: 0 },
        { title: "Periksa ujian Biologi", desc: "Kelas 10A", priority: "Sedang", statusIndex: 1 }
      ];
    } else if (type === "Marketing") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Ide Kampanye", order: 1, color: "#fef08a" },
        { workspaceId: workspace.id, name: "Persiapan", order: 2, color: "#cbd5e1" },
        { workspaceId: workspace.id, name: "Berjalan", order: 3, color: "#93c5fd" },
        { workspaceId: workspace.id, name: "Selesai", order: 4, color: "#86efac" }
      ];
      tasksToCreate = [
        { title: "Draft post sosmed", desc: "Untuk promo tengah tahun", priority: "Tinggi", statusIndex: 0 },
        { title: "Jalankan iklan FB", desc: "Budget Rp 500rb", priority: "Sedang", statusIndex: 1 }
      ];
    } else if (type === "Sales") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Prospek", order: 1, color: "#cbd5e1" },
        { workspaceId: workspace.id, name: "Kontak Pertama", order: 2, color: "#fde047" },
        { workspaceId: workspace.id, name: "Negosiasi", order: 3, color: "#f9a8d4" },
        { workspaceId: workspace.id, name: "Deal", order: 4, color: "#86efac" }
      ];
      tasksToCreate = [
        { title: "Follow up klien A", desc: "Tanyakan proposal kemaren", priority: "Tinggi", statusIndex: 1 },
        { title: "Kirim proposal B", desc: "Draft terbaru harga", priority: "Sedang", statusIndex: 0 }
      ];
    } else if (type === "Toko Kelontong") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Stok Habis", order: 1, color: "#fca5a5" },
        { workspaceId: workspace.id, name: "Dipesan", order: 2, color: "#fde047" },
        { workspaceId: workspace.id, name: "Tersedia", order: 3, color: "#86efac" }
      ];
      tasksToCreate = [
        { title: "Pesan beras", desc: "Beras merah 10kg", priority: "Tinggi", statusIndex: 0 },
        { title: "Restock minuman", desc: "Air mineral botol", priority: "Sedang", statusIndex: 1 }
      ];
    } else if (type === "UMKM") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Bahan Baku", order: 1, color: "#cbd5e1" },
        { workspaceId: workspace.id, name: "Produksi", order: 2, color: "#fde047" },
        { workspaceId: workspace.id, name: "Siap Jual", order: 3, color: "#86efac" },
        { workspaceId: workspace.id, name: "Terjual", order: 4, color: "#6ee7b7" }
      ];
      tasksToCreate = [
        { title: "Beli kemasan", desc: "Kardus polos", priority: "Tinggi", statusIndex: 0 },
        { title: "Buat produk sampel", desc: "Rasa baru", priority: "Sedang", statusIndex: 1 }
      ];
    } else if (type === "Restoran") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Persiapan Dapur", order: 1, color: "#cbd5e1" },
        { workspaceId: workspace.id, name: "Antrian Pesanan", order: 2, color: "#fca5a5" },
        { workspaceId: workspace.id, name: "Disajikan", order: 3, color: "#86efac" }
      ];
      tasksToCreate = [
        { title: "Belanja sayur", desc: "Sayur segar", priority: "Tinggi", statusIndex: 0 },
        { title: "Siapkan bumbu dasar", desc: "Untuk besok", priority: "Sedang", statusIndex: 0 }
      ];
    } else if (type === "Fotografer") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Booking", order: 1, color: "#cbd5e1" },
        { workspaceId: workspace.id, name: "Pemotretan", order: 2, color: "#fde047" },
        { workspaceId: workspace.id, name: "Editing", order: 3, color: "#c4b5fd" },
        { workspaceId: workspace.id, name: "Selesai", order: 4, color: "#86efac" }
      ];
      tasksToCreate = [
        { title: "Foto prewed klien C", desc: "Lokasi pantai", priority: "Tinggi", statusIndex: 1 },
        { title: "Edit foto produk D", desc: "Batch 1", priority: "Sedang", statusIndex: 2 }
      ];
    } else if (type === "Mahasiswa") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Tugas Baru", order: 1, color: "#cbd5e1" },
        { workspaceId: workspace.id, name: "Sedang Dikerjakan", order: 2, color: "#93c5fd" },
        { workspaceId: workspace.id, name: "Selesai", order: 3, color: "#86efac" }
      ];
      tasksToCreate = [
        { title: "Kerjakan makalah sejarah", desc: "Bab 1-3", priority: "Tinggi", statusIndex: 1 },
        { title: "Belajar ujian kalkulus", desc: "Besok lusa", priority: "Tinggi", statusIndex: 0 }
      ];
    } else if (type === "IT / Software") {
      statusesToCreate = [
        { workspaceId: workspace.id, name: "Backlog", order: 1, color: "#cbd5e1" },
        { workspaceId: workspace.id, name: "To Do", order: 2, color: "#fde047" },
        { workspaceId: workspace.id, name: "In Progress", order: 3, color: "#93c5fd" },
        { workspaceId: workspace.id, name: "Testing", order: 4, color: "#c4b5fd" },
        { workspaceId: workspace.id, name: "Done", order: 5, color: "#86efac" }
      ];
      tasksToCreate = [
        { title: "Setup repo", desc: "Init git", priority: "Tinggi", statusIndex: 4 },
        { title: "Bikin UI", desc: "Halaman depan", priority: "Sedang", statusIndex: 2 },
        { title: "Fix bug login", desc: "Gagal login kalau password salah", priority: "Tinggi", statusIndex: 1 }
      ];
    }

    // Insert statuses
    await prisma.status.createMany({
      data: statusesToCreate
    });

    // Get the inserted statuses to know their IDs
    const createdStatuses = await prisma.status.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { order: 'asc' }
    });

    if (tasksToCreate.length > 0 && createdStatuses.length > 0) {
      await prisma.workItem.createMany({
        data: tasksToCreate.map(task => ({
          title: task.title,
          description: task.desc,
          priority: task.priority,
          workspaceId: workspace.id,
          statusId: createdStatuses[task.statusIndex].id
        }))
      });
    }

    res.json(workspace);
  });

  app.get("/api/workspaces/:id", async (req, res) => {
    try {
      const workspace = await db.workspace.findUnique({
        where: { id: req.params.id },
        include: {
          statuses: { orderBy: { order: 'asc' } },
          customFields: { orderBy: { order: 'asc' } },
          workItems: {
            include: {
              status: true,
              assignee: { select: { id: true, name: true, color: true } },
              // Rows where this item is the blocked side, i.e. what it waits for.
              blockedBy: { select: { blockingId: true } },
            }
          }
        }
      });
      if (!workspace) return res.status(404).json({ error: "Workspace not found" });

      // Flatten the join rows to the plain `blockedBy: string[]` the client expects.
      res.json({
        ...workspace,
        workItems: (workspace.workItems || []).map((item: any) => ({
          ...item,
          blockedBy: (item.blockedBy || []).map((dep: any) => dep.blockingId),
        })),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get workspace" });
    }
  });

  // Custom fields
  app.get("/api/workspaces/:id/fields", async (req, res) => {
    try {
      const fields = await db.customField.findMany({
        where: { workspaceId: req.params.id },
        orderBy: { order: 'asc' },
      });
      res.json(fields);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get custom fields" });
    }
  });

  app.post("/api/workspaces/:id/fields", async (req, res) => {
    try {
      const { name, type, options, order } = req.body || {};
      if (!name) return res.status(400).json({ error: "name is required" });

      // `options` only means anything for select fields; accept either a real
      // array or an already-serialised string.
      const serialisedOptions =
        options === undefined || options === null
          ? undefined
          : typeof options === 'string' ? options : JSON.stringify(options);

      let finalOrder = order;
      if (finalOrder === undefined || finalOrder === null) {
        const last = await db.customField.findFirst({
          where: { workspaceId: req.params.id },
          orderBy: { order: 'desc' },
        });
        finalOrder = last ? last.order + 1 : 0;
      }

      const field = await db.customField.create({
        data: {
          workspaceId: req.params.id,
          name: String(name),
          type: type || "text",
          ...(serialisedOptions !== undefined && { options: serialisedOptions }),
          order: Number(finalOrder) || 0,
        },
      });
      res.json(field);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create custom field" });
    }
  });

  app.patch("/api/fields/:id", async (req, res) => {
    try {
      const { name, type, options, order } = req.body || {};
      const serialisedOptions =
        options === undefined
          ? undefined
          : options === null || typeof options === 'string' ? options : JSON.stringify(options);

      const field = await db.customField.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name: String(name) }),
          ...(type !== undefined && { type: String(type) }),
          ...(serialisedOptions !== undefined && { options: serialisedOptions }),
          ...(order !== undefined && { order: Number(order) || 0 }),
        },
      });
      res.json(field);
    } catch (error) {
      if ((error as any)?.code === "P2025") return res.status(404).json({ error: "Field not found" });
      console.error(error);
      res.status(500).json({ error: "Failed to update custom field" });
    }
  });

  app.delete("/api/fields/:id", async (req, res) => {
    try {
      await db.customField.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      // Idempotent: a double-delete (already gone) is not an error for the caller.
      if ((error as any)?.code === "P2025") return res.json({ success: true });
      console.error(error);
      res.status(500).json({ error: "Failed to delete custom field" });
    }
  });
  
  app.delete("/api/workspaces/:id", async (req, res) => {
    try {
      await prisma.workspace.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      // Idempotent: a double-delete (already gone) is not an error for the caller.
      if ((error as any)?.code === "P2025") return res.json({ success: true });
      console.error(error);
      res.status(500).json({ error: "Failed to delete workspace" });
    }
  });

  app.patch("/api/workspaces/:id", async (req, res) => {
    try {
      const { name, description, type } = req.body;
      const workspace = await prisma.workspace.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(type !== undefined && { type }),
        },
      });
      res.json(workspace);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workspace" });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const totalWorkspaces = await prisma.workspace.count();
      const totalTasks = await prisma.workItem.count();
      
      // Count tasks with due date in the past
      const overdueTasks = await prisma.workItem.count({
        where: {
          dueDate: { lt: new Date() },
          NOT: { status: { name: { in: ['Selesai', 'Done', 'Terjual', 'Deal', 'Tersedia', 'Disajikan'] } } }
        }
      });

      // Tasks completed (status name contains "Selesai" or "Done" etc.)
      const completedTasks = await prisma.workItem.count({
        where: {
          status: { name: { in: ['Selesai', 'Done', 'Terjual', 'Deal', 'Tersedia', 'Disajikan'] } }
        }
      });

      // Tasks created this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentTasks = await prisma.workItem.count({
        where: { createdAt: { gte: weekAgo } }
      });

      // Recent activity (latest 10 tasks)
      const recentActivity = await prisma.workItem.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: { workspace: true, status: true }
      });

      // Tasks due soon (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingTasks = await prisma.workItem.findMany({
        where: {
          dueDate: { gte: new Date(), lte: nextWeek }
        },
        include: { workspace: true, status: true },
        orderBy: { dueDate: 'asc' },
        take: 5
      });

      // Priority distribution
      const highPriority = await prisma.workItem.count({
        where: { priority: { in: ['Tinggi', 'Mendesak', 'High', 'Urgent'] } }
      });

      res.json({
        totalWorkspaces,
        totalTasks,
        completedTasks,
        overdueTasks,
        recentTasks,
        highPriority,
        inProgressTasks: totalTasks - completedTasks,
        recentActivity,
        upcomingTasks,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Data Export
  app.get("/api/export", async (req, res) => {
    try {
      const workspaces = await prisma.workspace.findMany({
        include: {
          statuses: { orderBy: { order: 'asc' } },
          workItems: true,
        }
      });
      res.json({
        exportedAt: new Date().toISOString(),
        version: "1.0",
        workspaces
      });
    } catch (error) {
      res.status(500).json({ error: "Export failed" });
    }
  });

  // Data Import 
  app.post("/api/import", async (req, res) => {
    try {
      const { workspaces } = req.body;
      if (!Array.isArray(workspaces)) return res.status(400).json({ error: "Invalid format" });

      let imported = 0;
      for (const ws of workspaces) {
        const workspace = await prisma.workspace.create({
          data: { name: ws.name, description: ws.description, type: ws.type || "Project" }
        });
        
        const statusIdMap: Record<string, string> = {};
        if (ws.statuses && Array.isArray(ws.statuses)) {
          for (const s of ws.statuses) {
            const created = await prisma.status.create({
              data: { name: s.name, color: s.color, order: s.order, workspaceId: workspace.id }
            });
            statusIdMap[s.id] = created.id;
          }
        }
        
        if (ws.workItems && Array.isArray(ws.workItems)) {
          for (const item of ws.workItems) {
            await prisma.workItem.create({
              data: {
                title: item.title,
                description: item.description,
                priority: item.priority,
                workspaceId: workspace.id,
                statusId: item.statusId ? (statusIdMap[item.statusId] || null) : null,
                labels: item.labels,
                subtasks: item.subtasks,
                activities: item.activities,
                dueDate: item.dueDate ? new Date(item.dueDate) : null,
              }
            });
          }
        }
        imported++;
      }

      res.json({ success: true, imported });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Import failed" });
    }
  });

  // Delete all data
  app.delete("/api/reset", async (req, res) => {
    try {
      await prisma.workItem.deleteMany({});
      await prisma.status.deleteMany({});
      await prisma.workspace.deleteMany({});
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Reset failed" });
    }
  });

  // Statuses
  app.post("/api/workspaces/:id/statuses", async (req, res) => {
    try {
      const { name, color, order } = req.body;
      const status = await prisma.status.create({
        data: { name, color, order, workspaceId: req.params.id }
      });
      res.json(status);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create status" });
    }
  });

  // Work Items
  app.post("/api/workspaces/:id/work-items", async (req, res) => {
    try {
      const { title, description, priority, statusId, labels, assigneeId, dueDate, isMilestone, customFields } = req.body;
      let finalStatusId = statusId;
      if (!finalStatusId) {
        const firstStatus = await prisma.status.findFirst({
          where: { workspaceId: req.params.id },
          orderBy: { order: 'asc' }
        });
        if (firstStatus) finalStatusId = firstStatus.id;
      }

      const initialActivities = [
        {
          timestamp: new Date().toISOString(),
          text: "Tugas dibuat"
        }
      ];

      const parsedDue = dueDate ? new Date(dueDate) : null;

      const workItem = await db.workItem.create({
        data: {
          workspaceId: req.params.id,
          title,
          description,
          priority: priority || "Sedang",
          statusId: finalStatusId,
          labels,
          assigneeId: assigneeId || null,
          dueDate: parsedDue && !isNaN(parsedDue.getTime()) ? parsedDue : null,
          isMilestone: !!isMilestone,
          ...(customFields !== undefined && {
            customFields: typeof customFields === 'string' || customFields === null
              ? customFields
              : JSON.stringify(customFields)
          }),
          activities: JSON.stringify(initialActivities)
        },
        include: {
          status: true,
          assignee: { select: { id: true, name: true, color: true } },
        }
      });
      res.json({ ...workItem, blockedBy: [] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create work item" });
    }
  });

  app.patch("/api/work-items/:id", async (req, res) => {
    try {
      const existing = await prisma.workItem.findUnique({
        where: { id: req.params.id },
        include: { status: true }
      });

      let activitiesList: { timestamp: string; text: string }[] = [];
      if (existing?.activities) {
        try {
          activitiesList = JSON.parse(existing.activities);
        } catch (e) {}
      }

      if (req.body.statusId && req.body.statusId !== existing?.statusId) {
        const oldStatusName = existing?.status?.name || "Tanpa Status";
        const newStatus = await prisma.status.findUnique({ where: { id: req.body.statusId } });
        const newStatusName = newStatus?.name || "Tanpa Status";
        activitiesList.push({
          timestamp: new Date().toISOString(),
          text: `Status diubah dari '${oldStatusName}' ke '${newStatusName}'`
        });
      }

      if (req.body.priority && req.body.priority !== existing?.priority) {
        activitiesList.push({
          timestamp: new Date().toISOString(),
          text: `Prioritas diubah dari '${existing?.priority || "Normal"}' ke '${req.body.priority}'`
        });
      }

      if (req.body.title && req.body.title !== existing?.title) {
        activitiesList.push({
          timestamp: new Date().toISOString(),
          text: `Judul diubah dari '${existing?.title}' ke '${req.body.title}'`
        });
      }

      if (req.body.description !== undefined && req.body.description !== existing?.description) {
        activitiesList.push({
          timestamp: new Date().toISOString(),
          text: `Deskripsi diperbarui`
        });
      }

      if (req.body.subtasks !== undefined && req.body.subtasks !== existing?.subtasks) {
        try {
          const oldSubs: { id: string; title: string; done: boolean }[] = existing?.subtasks ? JSON.parse(existing.subtasks) : [];
          const newSubs: { id: string; title: string; done: boolean }[] = req.body.subtasks ? JSON.parse(req.body.subtasks) : [];
          
          for (const ns of newSubs) {
            const os = oldSubs.find(x => x.id === ns.id);
            if (os) {
              if (os.done !== ns.done) {
                activitiesList.push({
                  timestamp: new Date().toISOString(),
                  text: `Subtugas '${ns.title}' ditandai ${ns.done ? "selesai" : "belum selesai"}`
                });
              } else if (os.title !== ns.title) {
                activitiesList.push({
                  timestamp: new Date().toISOString(),
                  text: `Subtugas diubah nama dari '${os.title}' ke '${ns.title}'`
                });
              }
            } else {
              activitiesList.push({
                timestamp: new Date().toISOString(),
                text: `Subtugas '${ns.title}' ditambahkan`
              });
            }
          }
          
          for (const os of oldSubs) {
            const ns = newSubs.find(x => x.id === os.id);
            if (!ns) {
              activitiesList.push({
                timestamp: new Date().toISOString(),
                text: `Subtugas '${os.title}' dihapus`
              });
            }
          }
        } catch (e) {
          activitiesList.push({
            timestamp: new Date().toISOString(),
            text: `Subtugas diperbarui`
          });
        }
      }

      const body = req.body || {};

      if (body.assigneeId !== undefined && body.assigneeId !== existing?.assigneeId) {
        const newAssignee = body.assigneeId
          ? await prisma.user.findUnique({ where: { id: body.assigneeId } })
          : null;
        activitiesList.push({
          timestamp: new Date().toISOString(),
          text: newAssignee ? `Ditugaskan ke '${newAssignee.name}'` : `Penugasan dilepas`
        });
      }

      // Only these columns may be written. The handler used to hand `req.body`
      // straight to Prisma, which blows up the moment a client echoes back a
      // whole item (id / status object / blockedBy array are not columns).
      const data: Record<string, any> = { activities: JSON.stringify(activitiesList) };
      for (const key of ["title", "description", "type", "priority", "labels", "subtasks"]) {
        if (body[key] !== undefined) data[key] = body[key];
      }
      for (const key of ["statusId", "assigneeId", "parentId"]) {
        if (body[key] !== undefined) data[key] = body[key] || null;
      }
      if (body.dueDate !== undefined) {
        const parsed = body.dueDate ? new Date(body.dueDate) : null;
        data.dueDate = parsed && !isNaN(parsed.getTime()) ? parsed : null;
      }
      if (body.isMilestone !== undefined) data.isMilestone = !!body.isMilestone;
      if (body.customFields !== undefined) {
        data.customFields =
          body.customFields === null || typeof body.customFields === 'string'
            ? body.customFields
            : JSON.stringify(body.customFields);
      }

      const workItem = await db.workItem.update({
        where: { id: req.params.id },
        data,
        include: {
          status: true,
          assignee: { select: { id: true, name: true, color: true } },
          blockedBy: { select: { blockingId: true } },
        }
      });
      res.json({
        ...workItem,
        blockedBy: (workItem.blockedBy || []).map((dep: any) => dep.blockingId),
      });
    } catch (error) {
      if ((error as any)?.code === "P2025") return res.status(404).json({ error: "Work item not found" });
      console.error(error);
      res.status(500).json({ error: "Failed to update work item" });
    }
  });

  // Task dependencies ("this item waits for that item")
  //
  // Walk the existing graph before inserting: if `blockingId` already waits —
  // directly or through a chain — on `blockedId`, the new edge would close a
  // loop and the Gantt view would recurse forever laying it out.
  async function wouldCreateCycle(blockedId: string, blockingId: string): Promise<boolean> {
    const seen = new Set<string>();
    const stack: string[] = [blockingId];
    while (stack.length) {
      const current = stack.pop() as string;
      if (current === blockedId) return true;
      if (seen.has(current)) continue;
      seen.add(current);
      const edges = await db.taskDependency.findMany({
        where: { blockedId: current },
        select: { blockingId: true },
      });
      for (const edge of edges) {
        if (!seen.has(edge.blockingId)) stack.push(edge.blockingId);
      }
    }
    return false;
  }

  app.post("/api/work-items/:id/dependencies", async (req, res) => {
    try {
      const blockedId = req.params.id;
      const { blockingId } = req.body || {};
      if (!blockingId) return res.status(400).json({ error: "blockingId is required" });
      if (blockingId === blockedId) {
        return res.status(400).json({ error: "A task cannot depend on itself" });
      }

      const [blocked, blocking] = await Promise.all([
        prisma.workItem.findUnique({ where: { id: blockedId }, select: { id: true } }),
        prisma.workItem.findUnique({ where: { id: blockingId }, select: { id: true } }),
      ]);
      if (!blocked || !blocking) return res.status(404).json({ error: "Work item not found" });

      const existing = await db.taskDependency.findFirst({ where: { blockedId, blockingId } });
      if (existing) return res.status(409).json({ error: "Dependency already exists" });

      if (await wouldCreateCycle(blockedId, blockingId)) {
        return res.status(400).json({ error: "That would create a circular dependency" });
      }

      const dependency = await db.taskDependency.create({ data: { blockedId, blockingId } });
      res.json(dependency);
    } catch (error) {
      if ((error as any)?.code === "P2002") return res.status(409).json({ error: "Dependency already exists" });
      console.error(error);
      res.status(500).json({ error: "Failed to create dependency" });
    }
  });

  app.delete("/api/work-items/:id/dependencies/:blockingId", async (req, res) => {
    try {
      // deleteMany, not delete: removing an edge that is already gone should
      // still report success.
      await db.taskDependency.deleteMany({
        where: { blockedId: req.params.id, blockingId: req.params.blockingId },
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete dependency" });
    }
  });

  app.delete("/api/work-items/:id", async (req, res) => {
    try {
      await prisma.workItem.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      // Idempotent: a double-delete (already gone) is not an error for the caller.
      if ((error as any)?.code === "P2025") return res.json({ success: true });
      console.error(error);
      res.status(500).json({ error: "Failed to delete work item" });
    }
  });
  
  app.get("/api/tasks", async (req, res) => {
    const tasks = await prisma.workItem.findMany({
      include: { workspace: true, status: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  });

  // Courses (LMS)
  app.get("/api/courses", async (req, res) => {
    try {
      // sections stays a JSON string in the response; ordered by order asc then createdAt asc
      const courses = await (prisma.course as any).findMany({
        orderBy: [{ createdAt: 'asc' }]
      });
      res.json(courses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get courses" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const { title, summary, category, color, order, sections } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });
      const course = await prisma.course.create({
        data: {
          title,
          ...(summary !== undefined && { summary }),
          ...(category !== undefined && { category }),
          ...(color !== undefined && { color }),
          ...(order !== undefined && { order }),
          ...(sections !== undefined && {
            sections: typeof sections === 'string' ? sections : JSON.stringify(sections)
          }),
        }
      });
      res.json(course);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  app.patch("/api/courses/:id", async (req, res) => {
    try {
      const { title, summary, category, color, order, sections } = req.body;
      const course = await prisma.course.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(summary !== undefined && { summary }),
          ...(category !== undefined && { category }),
          ...(color !== undefined && { color }),
          ...(order !== undefined && { order }),
          ...(sections !== undefined && {
            sections: typeof sections === 'string' ? sections : JSON.stringify(sections)
          }),
        }
      });
      res.json(course);
    } catch (error) {
      // Not found -> 404 so the client can distinguish a stale id from a server fault.
      if ((error as any)?.code === "P2025") return res.status(404).json({ error: "Course not found" });
      console.error(error);
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      // Before deleting the row, remove any uploaded files referenced by the
      // course's activities so we don't leak orphaned uploads.
      const course: any = await (prisma.course as any).findUnique({ where: { id: req.params.id } });
      if (course) {
        try {
          const sections: {
            activities?: { page?: { attachments?: { url?: string }[] } }[]
          }[] = JSON.parse(course.sections || course.lessons || "[]");
          for (const section of sections) {
            for (const activity of section.activities || []) {
              for (const attachment of activity.page?.attachments || []) {
                if (attachment.url && attachment.url.startsWith('/uploads/')) {
                  // Never trust the full url path — only use its basename inside uploadsDir
                  const filePath = path.join(uploadsDir, path.basename(attachment.url));
                  fs.unlink(filePath, () => {});
                }
              }
            }
          }
        } catch (e) {}
      }
      await prisma.course.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      // Idempotent: a double-delete (already gone) is not an error for the caller.
      if ((error as any)?.code === "P2025") return res.json({ success: true });
      console.error(error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // File uploads (base64 JSON body)
  app.post("/api/uploads", async (req, res) => {
    try {
      const { filename, mimeType, dataBase64 } = req.body;
      if (!filename || !dataBase64) {
        return res.status(400).json({ error: "filename and dataBase64 are required" });
      }
      const safeName = path.basename(String(filename)).replace(/[^a-zA-Z0-9._-]/g, '_');
      const buffer = Buffer.from(dataBase64, 'base64');
      if (buffer.length > 30 * 1024 * 1024) {
        return res.status(413).json({ error: "File too large (max 30MB)" });
      }
      const id = randomUUID();
      const storedName = `${id}-${safeName}`;
      fs.writeFileSync(path.join(uploadsDir, storedName), buffer);
      res.json({
        id,
        url: `/uploads/${storedName}`,
        name: filename,
        mimeType: mimeType || 'application/octet-stream',
        size: buffer.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // PyMuPDF Physical PDF Splitter
  app.post("/api/split-pdf", async (req, res) => {
    try {
      const { filename, dataBase64 } = req.body;
      if (!filename || !dataBase64) {
        return res.status(400).json({ error: "filename and dataBase64 are required" });
      }

      const safeName = path.basename(String(filename)).replace(/[^a-zA-Z0-9._-]/g, '_');
      const buffer = Buffer.from(dataBase64, 'base64');
      const id = randomUUID();
      const storedName = `${id}-${safeName}`;
      const fullPdfPath = path.join(uploadsDir, storedName);
      fs.writeFileSync(fullPdfPath, buffer);

      const scriptPath = path.join(process.cwd(), 'scripts', 'split_pdf.py');

      execFile('python', [scriptPath, fullPdfPath, uploadsDir], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          console.error("PyMuPDF execution error:", stderr || err.message);
          return res.status(500).json({ error: "Failed to split PDF with PyMuPDF", details: stderr || err.message });
        }
        try {
          const parsed = JSON.parse(stdout);
          res.json({
            ...parsed,
            original_url: `/uploads/${storedName}`,
            filename,
          });
        } catch (parseErr) {
          console.error("Failed to parse PyMuPDF output:", stdout);
          res.status(500).json({ error: "Invalid PyMuPDF output" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "PDF splitting endpoint failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
