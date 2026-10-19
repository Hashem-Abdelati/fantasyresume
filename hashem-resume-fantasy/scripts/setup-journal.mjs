import { randomBytes, scryptSync } from "node:crypto";
import { readFile, writeFile, chmod } from "node:fs/promises";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

// Suppress terminal echo; never place the access code in command history.
if (!process.stdin.isTTY)
  throw new Error("Run this command in an interactive terminal.");
let muted = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding);
    callback();
  },
});
const terminal = createInterface({
  input: process.stdin,
  output,
  terminal: true,
});
const ask = (prompt) =>
  new Promise((resolve) => {
    muted = false;
    terminal.question(prompt, (answer) => {
      muted = false;
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
try {
  const password = await ask("Choose your master spell (hidden): ");
  const confirmation = await ask("Repeat your master spell: ");
  if (!password || password !== confirmation || password.length > 128)
    throw new Error(
      "Spells must match and contain 1–128 characters. Nothing changed.",
    );
  let contents = "";
  try {
    contents = await readFile(".env.local", "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const salt = randomBytes(24).toString("hex");
  const values = {
    JOURNAL_PASSWORD_HASH: `${salt}:${scryptSync(password, salt, 32).toString("hex")}`,
    JOURNAL_SESSION_SECRET: randomBytes(48).toString("hex"),
  };
  for (const [key, value] of Object.entries(values)) {
    contents = contents.replace(new RegExp(`^${key}=.*\\r?\\n?`, "gm"), "");
    if (contents && !contents.endsWith("\n")) contents += "\n";
    contents += `${key}=${value}\n`;
  }
  await writeFile(".env.local", contents, { mode: 0o600 });
  await chmod(".env.local", 0o600);
  console.log(
    "Server credentials saved privately in .env.local. Restart the preview. For hosting, copy these two values into Vercel environment variables; never commit this file.",
  );
} finally {
  terminal.close();
}
