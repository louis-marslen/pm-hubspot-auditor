const HUBSPOT_API_BASE = "https://api.hubapi.com";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class HubSpotClient {
  constructor(private accessToken: string) {}

  private async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const res = await fetch(url, options);
      if (res.status === 429) {
        if (attempt === retries) return res;
        // Attendre 1s + backoff exponentiel avant de réessayer
        await sleep(1000 * (attempt + 1));
        continue;
      }
      return res;
    }
    throw new Error("Unreachable");
  }

  async get<T>(path: string): Promise<T> {
    const res = await this.fetchWithRetry(`${HUBSPOT_API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HubSpot GET ${path} → ${res.status}: ${body}`);
    }
    return res.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetchWithRetry(`${HUBSPOT_API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HubSpot POST ${path} → ${res.status}: ${text}`);
    }
    return res.json();
  }

  /**
   * Traite un tableau d'items en groupes de 3, avec 400ms entre chaque groupe.
   * Respecte la limite secondaire HubSpot sur le search endpoint (~4 req/sec).
   */
  async batch<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += 3) {
      const chunk = items.slice(i, i + 3);
      const chunkResults = await Promise.all(chunk.map(fn));
      results.push(...chunkResults);
      if (i + 3 < items.length) {
        await sleep(400);
      }
    }
    return results;
  }
}
