import type { FlatRule } from "./transform-rules";

export interface SeverityGroups {
  critiques: FlatRule[];
  avertissements: FlatRule[];
  infos: FlatRule[];
  conformes: FlatRule[];
}

export function groupBySeverity(rules: FlatRule[]): SeverityGroups {
  const critiques: FlatRule[] = [];
  const avertissements: FlatRule[] = [];
  const infos: FlatRule[] = [];
  const conformes: FlatRule[] = [];

  for (const rule of rules) {
    if (rule.isEmpty) {
      conformes.push(rule);
    } else if (rule.severity === "critique") {
      critiques.push(rule);
    } else if (rule.severity === "avertissement") {
      avertissements.push(rule);
    } else {
      infos.push(rule);
    }
  }

  // Sort each group by count descending
  const byCountDesc = (a: FlatRule, b: FlatRule) => b.count - a.count;
  critiques.sort(byCountDesc);
  avertissements.sort(byCountDesc);
  infos.sort(byCountDesc);

  return { critiques, avertissements, infos, conformes };
}
