import { prisma } from "../_lib/prisma.js";

export async function ensureDefaultTeam() {
  const existing = await prisma.team.findFirst({
    include: { members: { orderBy: { createdAt: "asc" } } },
  });

  if (existing) return existing;

  return prisma.team.create({
    data: {
      name: "Briefly Crew",
      members: {
        create: [
          { name: "Николай", role: "Project Manager", avatarEmoji: "👨‍💻" },
          { name: "Дизайнер", role: "Designer", avatarEmoji: "🎨" },
          { name: "Рилсмейкер", role: "Reels Maker", avatarEmoji: "🎬" },
          { name: "Сторисмейкер", role: "Stories Maker", avatarEmoji: "📱" },
        ],
      },
    },
    include: { members: { orderBy: { createdAt: "asc" } } },
  });
}
