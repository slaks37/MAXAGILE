import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Menyemai data awal (Seeding initial data)...");

  // Hapus data yang ada
  await prisma.workItem.deleteMany();
  await prisma.status.deleteMany();
  await prisma.workspace.deleteMany();

  // Buat ruang kerja contoh
  const workspace = await prisma.workspace.create({
    data: {
      name: "Persiapan Kurikulum Semester Ganjil",
      description: "Manajemen persiapan materi dan jadwal untuk semester ganjil.",
      type: "Pendidikan",
    },
  });

  // Buat status
  const statusTodo = await prisma.status.create({
    data: { workspaceId: workspace.id, name: "Akan Dilakukan", order: 1, color: "#cbd5e1" },
  });
  const statusInProgress = await prisma.status.create({
    data: { workspaceId: workspace.id, name: "Sedang Dikerjakan", order: 2, color: "#93c5fd" },
  });
  const statusDone = await prisma.status.create({
    data: { workspaceId: workspace.id, name: "Selesai", order: 3, color: "#86efac" },
  });

  // Buat tugas (work items)
  await prisma.workItem.createMany({
    data: [
      {
        workspaceId: workspace.id,
        title: "Menyusun RPP Matematika Kelas 10",
        description: "Drafting RPP sesuai dengan kurikulum merdeka.",
        priority: "Mendesak",
        statusId: statusTodo.id,
      },
      {
        workspaceId: workspace.id,
        title: "Materi Presentasi Fisika",
        description: "Membuat slide presentasi untuk bab Kinematika.",
        priority: "Sedang",
        statusId: statusInProgress.id,
      },
      {
        workspaceId: workspace.id,
        title: "Menyiapkan Soal Kuis Biologi",
        description: "Soal pilihan ganda 20 butir untuk bab Sel.",
        priority: "Tinggi",
        statusId: statusTodo.id,
      },
      {
        workspaceId: workspace.id,
        title: "Rapat Koordinasi Guru Sains",
        description: "Jadwal dan agenda rapat sudah dibagikan.",
        priority: "Rendah",
        statusId: statusDone.id,
      },
    ],
  });

  console.log("Penyemaian selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
