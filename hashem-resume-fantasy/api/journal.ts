import { journalHandler } from "../server/journal-handler.js";
import { redisStore } from "../server/journal-store.js";
const env = process.env;
export default journalHandler({
  production: true,
  passwordHash: env.JOURNAL_PASSWORD_HASH,
  secret: env.JOURNAL_SESSION_SECRET,
  store:
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
      ? redisStore(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN)
      : null,
});
