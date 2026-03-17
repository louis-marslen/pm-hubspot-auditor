import fs from "fs";
import path from "path";

const KB_FILES = [
  "hubspot-best-practices.md",
  "crm-maturity-model.md",
  "cross-domain-patterns.md",
  "project-templates.md",
];

/**
 * Charge et concatène les 4 fichiers de knowledge base pour injection dans le system prompt.
 */
export function loadKnowledgeBase(): string {
  const dir = path.join(process.cwd(), "lib/audit/knowledge");
  return KB_FILES.map((file) => fs.readFileSync(path.join(dir, file), "utf-8")).join("\n\n---\n\n");
}
