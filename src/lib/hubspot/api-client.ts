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
      const bodyPreview = JSON.stringify(body).slice(0, 200);
      throw new Error(`HubSpot POST ${path} → ${res.status}: ${text} [body: ${bodyPreview}]`);
    }
    return res.json();
  }

  /**
   * Traite un tableau d'items 2 par 2 avec 700ms entre chaque groupe.
   * Rate effectif : 2/700ms ≈ 2.86 req/s — sous la limite secondaire HubSpot (4 req/s)
   * pour le search endpoint, ce qui évite les 429 et les retries coûteux.
   */
  async batch<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += 2) {
      const chunk = items.slice(i, i + 2);
      const chunkResults = await Promise.all(chunk.map(fn));
      results.push(...chunkResults);
      if (i + 2 < items.length) {
        await sleep(700);
      }
    }
    return results;
  }
}
