import OpenAI from "openai";
import { GlobalAuditResults, AUDIT_DOMAINS, type AuditDomainId } from "@/lib/audit/types";

/**
 * Génère un résumé exécutif de l'audit via OpenAI.
 * Retourne null si la clé API est absente ou en cas d'erreur (fallback silencieux).
 */
export async function generateLlmSummary(global: GlobalAuditResults, selectedDomains?: AuditDomainId[]): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1";
  const { globalScore, propertyResults, workflowResults, contactResults, companyResults, userResults } = global;

  // Recommandation calibrée selon le score
  let callToAction: string;
  if (globalScore < 50) {
    callToAction = "Une intervention immédiate est recommandée.";
  } else if (globalScore < 70) {
    callToAction = "Des corrections sont recommandées dans les prochaines semaines.";
  } else if (globalScore < 90) {
    callToAction = "Des améliorations sont souhaitables lors de la prochaine revue.";
  } else {
    callToAction = "Votre workspace est en bonne santé. Ré-audit dans 3 mois recommandé.";
  }

  const wfSummary = workflowResults
    ? `Workflows : ${workflowResults.totalWorkflows} analysés, score ${workflowResults.score ?? "N/A"}/100 (${workflowResults.totalCritiques} critiques, ${workflowResults.totalAvertissements} avertissements).`
    : "Aucun workflow détecté — domaine exclu du score global.";

  const contactSummary = contactResults
    ? `Contacts : ${contactResults.totalContacts} analysés, score ${contactResults.score}/100 (${contactResults.totalCritiques} critiques, ${contactResults.totalAvertissements} avertissements, ${contactResults.totalInfos} infos). Doublons email : ${contactResults.c06.length} clusters, doublons nom+company : ${contactResults.c07.length} clusters, doublons téléphone : ${contactResults.c08.length} clusters.`
    : "Aucun contact détecté — domaine exclu du score global.";

  const companySummary = companyResults
    ? `Companies : ${companyResults.totalCompanies} analysées, score ${companyResults.score}/100 (${companyResults.totalCritiques} critiques, ${companyResults.totalAvertissements} avertissements, ${companyResults.totalInfos} infos). Doublons domain : ${companyResults.co02.length} clusters, doublons nom : ${companyResults.co03.length} clusters, orphelines : ${companyResults.co04.length}.`
    : "Aucune company détectée — domaine exclu du score global.";

  const userSummary = userResults?.hasUsers && !userResults.scopeError
    ? `Utilisateurs & Équipes : ${userResults.totalUsers} utilisateurs, ${userResults.totalTeams} équipes, score ${userResults.score}/100 (${userResults.totalCritiques} critiques, ${userResults.totalAvertissements} avertissements, ${userResults.totalInfos} infos). Super Admins : ${userResults.u02.superAdminCount}/${userResults.u02.totalUsers}, inactifs : ${userResults.u05.inactiveUsers.length}, sans équipe : ${userResults.u01.length}.`
    : "Utilisateurs & Équipes : domaine non analysé.";

  // Contexte de périmètre pour audits partiels
  const allImplemented = AUDIT_DOMAINS.filter((d) => d.implemented);
  const auditedDomains = selectedDomains ?? allImplemented.map((d) => d.id);
  const auditedLabels = auditedDomains.map((id) => AUDIT_DOMAINS.find((d) => d.id === id)?.label ?? id);
  const nonAuditedLabels = allImplemented.filter((d) => !auditedDomains.includes(d.id)).map((d) => d.label);
  const isPartial = nonAuditedLabels.length > 0;

  const scopeContext = isPartial
    ? `\nPérimètre : Domaines audités : ${auditedLabels.join(", ")} (${auditedDomains.length}/${allImplemented.length}).\nDomaines non inclus dans cet audit : ${nonAuditedLabels.join(", ")}.\nLe score global de ${globalScore}/100 est calculé sur les ${auditedDomains.length} domaines audités uniquement.\n`
    : "";

  const scopeInstruction = isPartial
    ? " Ne commente que les domaines audités. Tu peux suggérer en une phrase d'auditer les domaines manquants."
    : "";

  const prompt = `Tu es un expert HubSpot qui rédige un résumé exécutif d'audit CRM pour un dirigeant non technique.

Données d'audit :
- Score global : ${globalScore}/100 (${global.globalScoreLabel})${scopeContext}
- Propriétés : score ${propertyResults.score}/100, ${propertyResults.totalCritiques} critiques, ${propertyResults.totalAvertissements} avertissements, ${propertyResults.totalInfos} infos
- ${contactSummary}
- ${companySummary}
- ${wfSummary}
- ${userSummary}
- Contacts analysés : ${propertyResults.objectCounts.contacts ?? 0}, companies : ${propertyResults.objectCounts.companies ?? 0}, deals : ${propertyResults.objectCounts.deals ?? 0}

Rédige un résumé exécutif en français, en 3 à 5 phrases maximum. Ton dirigeant, direct et factuel. Mentionne les principaux problèmes identifiés et termine par : "${callToAction}"${scopeInstruction}`;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0]?.message?.content ?? null;
  } catch {
    // Fallback silencieux — ne jamais bloquer l'affichage du rapport
    return null;
  }
}
