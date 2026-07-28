import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
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
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: {
        statuses: { orderBy: { order: 'asc' } },
        workItems: { include: { status: true } }
      }
    });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });
    res.json(workspace);
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
      const { title, description, priority, statusId, labels } = req.body;
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

      const workItem = await prisma.workItem.create({
        data: {
          workspaceId: req.params.id,
          title,
          description,
          priority: priority || "Sedang",
          statusId: finalStatusId,
          labels,
          activities: JSON.stringify(initialActivities)
        },
        include: { status: true }
      });
      res.json(workItem);
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

      req.body.activities = JSON.stringify(activitiesList);

      const workItem = await prisma.workItem.update({
        where: { id: req.params.id },
        data: req.body,
        include: { status: true }
      });
      res.json(workItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update work item" });
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
