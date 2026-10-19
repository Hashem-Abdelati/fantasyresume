import { createServer } from "vite";
const server = await createServer({
  server: { host: "127.0.0.1", port: 0 },
  logLevel: "error",
});
await server.listen();
console.log(`JOURNAL_TEST_PORT=${server.httpServer.address().port}`);
process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});
