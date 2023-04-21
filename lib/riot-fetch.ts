import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

if (!process.env.RIOT_API_KEY) throw `RIOT_API_KEY env variable not found.`;

const REQUEST_COOLDOWN_MS = 500; // 1200: 100 requests every 2 minutes(s)

function sleep(durationMS: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, durationMS);
  });
}

const FETCH_OPTIONS: RequestInit = {
  headers: {
    "X-Riot-Token": process.env.RIOT_API_KEY,
  },
};

export async function riotFetch(
  ...args: Parameters<typeof fetch>
): Promise<any> {
  try {
    args[1] = { ...args[1], ...FETCH_OPTIONS };

    const result = await fetch(...args).then(async (res) => {
      if (res.ok) {
        return res.json();
      } else {
        if (res.status === 429) {
          const retryAfterInSeconds = res.headers.get("retry-after");
          if (retryAfterInSeconds) {
            return parseInt(retryAfterInSeconds);
          } else {
            throw `Server Response: ${res.status}. Retry-after header not found.`;
          }
        } else {
          throw `Server Response: ${res.status}`;
        }
      }
    });

    if (typeof result === "number") {
      console.log(
        `[429](Rate Limit Exceeded): retrying the request after ${result}s...`
      );
      await sleep(result * 1000);
      return riotFetch(...args);
    }

    const msg =
      typeof args[0] === "string"
        ? args[0]
        : args[0] instanceof URL
        ? args[0].href
        : args[0].url;

    console.log(
      `cooling down (${(REQUEST_COOLDOWN_MS / 1000).toFixed(
        1
      )}s) after a request to: ${msg}.`
    );
    await sleep(REQUEST_COOLDOWN_MS);

    return result;
  } catch (e) {
    console.error(e);
  }
}
