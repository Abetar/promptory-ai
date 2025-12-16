const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();
  const keys = Object.keys(p).filter((k) => !k.startsWith("$"));
  console.log(keys);
  await p.$disconnect();
})();
