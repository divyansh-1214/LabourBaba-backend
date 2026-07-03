import prisma from "./config/prisma";

async function main() {
  console.log("Prisma keys:", Object.keys(prisma).filter(k => !k.startsWith("_")));
  try {
    const clients = await prisma.customer.findMany();
    console.log("Clients count:", clients.length);
  } catch (err: any) {
    console.error("Error fetching clients:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
