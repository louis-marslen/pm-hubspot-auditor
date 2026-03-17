import type { ReactNode } from "react";
import type {
  AuditResults, WorkflowAuditResults, ContactAuditResults,
  CompanyAuditResults, UserAuditResults, DealAuditResults, LeadAuditResults,
} from "@/lib/audit/types";
import { BUSINESS_IMPACTS } from "@/lib/audit/business-impact";

export type Severity = "critique" | "avertissement" | "info";

export interface FlatRule {
  ruleKey: string;
  title: string;
  description: string;
  severity: Severity;
  domainId: string;
  domainLabel: string;
  count: number;
  hasBusinessImpact: boolean;
  isEmpty: boolean;
  renderDetail?: () => ReactNode;
}

// Helper: count items for array-based rules
function arrLen(arr: unknown[] | null | undefined): number {
  return Array.isArray(arr) ? arr.length : 0;
}

interface RuleDef {
  ruleKey: string;
  title: string;
  severity: Severity;
  domainId: string;
  domainLabel: string;
  count: number;
  isEmpty: boolean;
  description: string;
  renderDetail?: () => ReactNode;
}

function mkRule(def: RuleDef): FlatRule {
  return {
    ...def,
    hasBusinessImpact: !!BUSINESS_IMPACTS[def.ruleKey],
  };
}

// ─── Properties P1-P6 ─────────────────────────────────────────────────────

function flattenPropertyRules(r: AuditResults, renderDetail: (ruleKey: string) => (() => ReactNode) | undefined): FlatRule[] {
  const d = "properties";
  const dl = "Propriétés custom";

  return [
    mkRule({ ruleKey: "p1", title: "Propriétés vides depuis plus de 90 jours", severity: "critique", domainId: d, domainLabel: dl, count: r.p1.length, isEmpty: r.p1.length === 0, description: r.p1.length > 0 ? `${r.p1.length} propriétés (${r.p1.slice(0, 3).map(p => p.label).join(", ")}${r.p1.length > 3 ? "…" : ""}) sont vides et encombrent votre workspace` : "", renderDetail: renderDetail("p1") }),
    mkRule({ ruleKey: "p2", title: "Propriétés sous-utilisées (fill rate < 5%)", severity: "avertissement", domainId: d, domainLabel: dl, count: r.p2.length, isEmpty: r.p2.length === 0, description: r.p2.length > 0 ? `${r.p2.length} propriétés avec un taux de remplissage inférieur à 5%` : "", renderDetail: renderDetail("p2") }),
    mkRule({ ruleKey: "p3", title: "Doublons de propriétés (labels similaires)", severity: "avertissement", domainId: d, domainLabel: dl, count: r.p3.length, isEmpty: r.p3.length === 0, description: r.p3.length > 0 ? `${r.p3.length} paires de propriétés avec des noms similaires` : "", renderDetail: renderDetail("p3") }),
    mkRule({ ruleKey: "p4", title: "Propriétés sans description", severity: "info", domainId: d, domainLabel: dl, count: r.p4.length, isEmpty: r.p4.length === 0, description: r.p4.length > 0 ? `${r.p4.length} propriétés sans documentation` : "", renderDetail: renderDetail("p4") }),
    mkRule({ ruleKey: "p5", title: "Propriétés non organisées (groupe par défaut)", severity: "info", domainId: d, domainLabel: dl, count: r.p5.length, isEmpty: r.p5.length === 0, description: r.p5.length > 0 ? `${r.p5.length} propriétés non classées dans un groupe métier` : "", renderDetail: renderDetail("p5") }),
    mkRule({ ruleKey: "p6", title: "Types de données inadaptés", severity: "avertissement", domainId: d, domainLabel: dl, count: r.p6.length, isEmpty: r.p6.length === 0, description: r.p6.length > 0 ? `${r.p6.length} propriétés avec un type de données inadapté` : "", renderDetail: renderDetail("p6") }),
  ];
}

// ─── Contacts C-01 à C-12 ────────────────────────────────────────────────

function flattenContactRules(c: ContactAuditResults, renderDetail: (ruleKey: string) => (() => ReactNode) | undefined): FlatRule[] {
  const d = "contacts";
  const dl = "Contacts";

  return [
    mkRule({ ruleKey: "c01", title: "Taux de contacts avec email renseigné", severity: "critique", domainId: d, domainLabel: dl, count: c.c01.triggered ? 1 : 0, isEmpty: !c.c01.triggered, description: c.c01.triggered ? `Seulement ${Math.round(c.c01.rate * 100)}% de contacts avec email (seuil : ${Math.round(c.c01.threshold * 100)}%)` : "", renderDetail: renderDetail("c01") }),
    mkRule({ ruleKey: "c02", title: "Contacts sans prénom ni nom", severity: "critique", domainId: d, domainLabel: dl, count: c.c02.count, isEmpty: c.c02.count === 0, description: c.c02.count > 0 ? `${c.c02.count.toLocaleString("fr-FR")} contacts sans identité` : "", renderDetail: renderDetail("c02") }),
    mkRule({ ruleKey: "c03", title: "Taux de contacts avec lifecycle stage", severity: "avertissement", domainId: d, domainLabel: dl, count: c.c03.triggered ? 1 : 0, isEmpty: !c.c03.triggered, description: c.c03.triggered ? `Seulement ${Math.round(c.c03.rate * 100)}% de contacts avec lifecycle (seuil : ${Math.round(c.c03.threshold * 100)}%)` : "", renderDetail: renderDetail("c03") }),
    mkRule({ ruleKey: "c04a", title: "Deal gagné sans lifecycle customer", severity: "avertissement", domainId: d, domainLabel: dl, count: c.c04a.count, isEmpty: c.c04a.count === 0, description: c.c04a.count > 0 ? `${c.c04a.count.toLocaleString("fr-FR")} contacts avec lifecycle incohérent` : "", renderDetail: renderDetail("c04a") }),
    mkRule({ ruleKey: "c04b", title: "Customers sans deal gagné", severity: "info", domainId: d, domainLabel: dl, count: c.c04b.count, isEmpty: c.c04b.count === 0, description: c.c04b.count > 0 ? `${c.c04b.count.toLocaleString("fr-FR")} customers sans deal closedwon` : "", renderDetail: renderDetail("c04b") }),
    mkRule({ ruleKey: "c04c", title: "Aucun MQL ni SQL avec des deals ouverts", severity: "avertissement", domainId: d, domainLabel: dl, count: c.c04c.triggered ? 1 : 0, isEmpty: !c.c04c.triggered, description: c.c04c.triggered ? "Votre entonnoir de qualification n'est pas tracé dans HubSpot" : "", renderDetail: renderDetail("c04c") }),
    mkRule({ ruleKey: "c04d", title: "Leads précoces avec deal actif", severity: "info", domainId: d, domainLabel: dl, count: c.c04d.count, isEmpty: c.c04d.count === 0, description: c.c04d.count > 0 ? `${c.c04d.count} contacts en phase lead avec des deals associés` : "", renderDetail: renderDetail("c04d") }),
    mkRule({ ruleKey: "c05", title: "Taux de contacts rattachés à une company", severity: "info", domainId: d, domainLabel: dl, count: c.c05 !== null && c.c05.triggered ? 1 : 0, isEmpty: c.c05 === null || !c.c05.triggered, description: c.c05 !== null && c.c05.triggered ? `Seulement ${Math.round(c.c05.rate * 100)}% de contacts rattachés à une company` : "", renderDetail: renderDetail("c05") }),
    mkRule({ ruleKey: "c06", title: "Doublons email (exact après normalisation)", severity: "critique", domainId: d, domainLabel: dl, count: c.c06.length, isEmpty: c.c06.length === 0, description: c.c06.length > 0 ? `${c.c06.length} clusters de doublons email détectés` : "", renderDetail: renderDetail("c06") }),
    mkRule({ ruleKey: "c07", title: "Doublons nom + company (similarité > 85%)", severity: "avertissement", domainId: d, domainLabel: dl, count: c.c07.length, isEmpty: c.c07.length === 0, description: c.c07.length > 0 ? `${c.c07.length} clusters de doublons par nom` : "", renderDetail: renderDetail("c07") }),
    mkRule({ ruleKey: "c08", title: "Doublons téléphone (après normalisation)", severity: "avertissement", domainId: d, domainLabel: dl, count: c.c08.length, isEmpty: c.c08.length === 0, description: c.c08.length > 0 ? `${c.c08.length} clusters de doublons téléphone` : "", renderDetail: renderDetail("c08") }),
    mkRule({ ruleKey: "c09", title: "Emails au format invalide", severity: "avertissement", domainId: d, domainLabel: dl, count: c.c09.length, isEmpty: c.c09.length === 0, description: c.c09.length > 0 ? `${c.c09.length} contacts avec un email invalide` : "", renderDetail: renderDetail("c09") }),
    mkRule({ ruleKey: "c10", title: "Contacts inactifs depuis plus d'un an", severity: "info", domainId: d, domainLabel: dl, count: c.c10.length, isEmpty: c.c10.length === 0, description: c.c10.length > 0 ? `${c.c10.length} contacts sans activité depuis 365 jours` : "", renderDetail: renderDetail("c10") }),
    mkRule({ ruleKey: "c11", title: "Contacts sans propriétaire assigné", severity: "info", domainId: d, domainLabel: dl, count: c.c11.length, isEmpty: c.c11.length === 0, description: c.c11.length > 0 ? `${c.c11.length} contacts sans owner` : "", renderDetail: renderDetail("c11") }),
    mkRule({ ruleKey: "c12", title: "Contacts sans source d'acquisition", severity: "info", domainId: d, domainLabel: dl, count: c.c12.length, isEmpty: c.c12.length === 0, description: c.c12.length > 0 ? `${c.c12.length} contacts sans source` : "", renderDetail: renderDetail("c12") }),
  ];
}

// ─── Companies CO-01 à CO-08 ─────────────────────────────────────────────

function flattenCompanyRules(co: CompanyAuditResults, renderDetail: (ruleKey: string) => (() => ReactNode) | undefined): FlatRule[] {
  const d = "companies";
  const dl = "Companies";

  return [
    mkRule({ ruleKey: "co01", title: "Taux de companies avec domaine renseigné", severity: "critique", domainId: d, domainLabel: dl, count: co.co01.triggered ? 1 : 0, isEmpty: !co.co01.triggered, description: co.co01.triggered ? `Seulement ${Math.round(co.co01.rate * 100)}% de companies avec domaine` : "", renderDetail: renderDetail("co01") }),
    mkRule({ ruleKey: "co02", title: "Doublons domain (exact après normalisation)", severity: "critique", domainId: d, domainLabel: dl, count: co.co02.length, isEmpty: co.co02.length === 0, description: co.co02.length > 0 ? `${co.co02.length} clusters de doublons domain` : "", renderDetail: renderDetail("co02") }),
    mkRule({ ruleKey: "co03", title: "Doublons nom entreprise (similarité > 85%)", severity: "avertissement", domainId: d, domainLabel: dl, count: co.co03.length, isEmpty: co.co03.length === 0, description: co.co03.length > 0 ? `${co.co03.length} clusters de doublons par nom` : "", renderDetail: renderDetail("co03") }),
    mkRule({ ruleKey: "co04", title: "Companies sans contact (> 90 jours)", severity: "avertissement", domainId: d, domainLabel: dl, count: co.co04.length, isEmpty: co.co04.length === 0, description: co.co04.length > 0 ? `${co.co04.length} companies orphelines` : "", renderDetail: renderDetail("co04") }),
    mkRule({ ruleKey: "co05", title: "Companies sans propriétaire assigné", severity: "info", domainId: d, domainLabel: dl, count: co.co05.length, isEmpty: co.co05.length === 0, description: co.co05.length > 0 ? `${co.co05.length} companies sans owner` : "", renderDetail: renderDetail("co05") }),
    mkRule({ ruleKey: "co06", title: "Companies sans industrie", severity: "info", domainId: d, domainLabel: dl, count: co.co06.length, isEmpty: co.co06.length === 0, description: co.co06.length > 0 ? `${co.co06.length} companies sans industrie renseignée` : "", renderDetail: renderDetail("co06") }),
    mkRule({ ruleKey: "co07", title: "Companies sans dimensionnement (effectif + CA)", severity: "info", domainId: d, domainLabel: dl, count: co.co07.length, isEmpty: co.co07.length === 0, description: co.co07.length > 0 ? `${co.co07.length} companies sans effectif ni CA` : "", renderDetail: renderDetail("co07") }),
    mkRule({ ruleKey: "co08", title: "Companies inactives depuis plus d'un an", severity: "info", domainId: d, domainLabel: dl, count: co.co08.length, isEmpty: co.co08.length === 0, description: co.co08.length > 0 ? `${co.co08.length} companies sans activité depuis 365 jours` : "", renderDetail: renderDetail("co08") }),
  ];
}

// ─── Workflows W1-W7 ─────────────────────────────────────────────────────

function flattenWorkflowRules(w: WorkflowAuditResults, renderDetail: (ruleKey: string) => (() => ReactNode) | undefined): FlatRule[] {
  const d = "workflows";
  const dl = "Workflows";

  return [
    mkRule({ ruleKey: "w1", title: "Workflows actifs avec taux d'erreur > 10%", severity: "critique", domainId: d, domainLabel: dl, count: w.w1.length, isEmpty: w.w1.length === 0, description: w.w1.length > 0 ? `${w.w1.length} workflows avec un fort taux d'erreur` : "", renderDetail: renderDetail("w1") }),
    mkRule({ ruleKey: "w2", title: "Workflows actifs sans actions configurées", severity: "critique", domainId: d, domainLabel: dl, count: w.w2.length, isEmpty: w.w2.length === 0, description: w.w2.length > 0 ? `${w.w2.length} workflows activés mais sans action` : "", renderDetail: renderDetail("w2") }),
    mkRule({ ruleKey: "w3", title: "Workflows actifs sans enrôlement récent (> 90j)", severity: "avertissement", domainId: d, domainLabel: dl, count: w.w3.length, isEmpty: w.w3.length === 0, description: w.w3.length > 0 ? `${w.w3.length} workflows potentiellement obsolètes` : "", renderDetail: renderDetail("w3") }),
    mkRule({ ruleKey: "w4", title: "Workflows inactifs depuis plus de 90 jours", severity: "avertissement", domainId: d, domainLabel: dl, count: w.w4.length, isEmpty: w.w4.length === 0, description: w.w4.length > 0 ? `${w.w4.length} workflows inactifs à archiver` : "", renderDetail: renderDetail("w4") }),
    mkRule({ ruleKey: "w5", title: "Workflows récemment désactivés", severity: "info", domainId: d, domainLabel: dl, count: w.w5.length, isEmpty: w.w5.length === 0, description: w.w5.length > 0 ? `${w.w5.length} workflows récemment désactivés` : "", renderDetail: renderDetail("w5") }),
    mkRule({ ruleKey: "w6", title: "Workflows avec noms non descriptifs", severity: "info", domainId: d, domainLabel: dl, count: w.w6.length, isEmpty: w.w6.length === 0, description: w.w6.length > 0 ? `${w.w6.length} workflows avec des noms génériques` : "", renderDetail: renderDetail("w6") }),
    mkRule({ ruleKey: "w7", title: "Workflows sans dossier", severity: "info", domainId: d, domainLabel: dl, count: w.w7.length, isEmpty: w.w7.length === 0, description: w.w7.length > 0 ? `${w.w7.length} workflows non organisés` : "", renderDetail: renderDetail("w7") }),
  ];
}

// ─── Users U-01 à U-07 ──────────────────────────────────────────────────

function flattenUserRules(u: UserAuditResults, renderDetail: (ruleKey: string) => (() => ReactNode) | undefined): FlatRule[] {
  const d = "users";
  const dl = "Utilisateurs & Équipes";

  return [
    mkRule({ ruleKey: "u01", title: "Utilisateurs sans équipe", severity: "avertissement", domainId: d, domainLabel: dl, count: u.u01.length, isEmpty: u.u01.length === 0, description: u.u01.length > 0 ? `${u.u01.length} utilisateurs non rattachés à une équipe` : "", renderDetail: renderDetail("u01") }),
    mkRule({ ruleKey: "u02", title: "Super Admins en excès", severity: "critique", domainId: d, domainLabel: dl, count: u.u02.triggered ? u.u02.superAdminCount : 0, isEmpty: !u.u02.triggered, description: u.u02.triggered ? `${u.u02.superAdminCount} Super Admins sur ${u.u02.totalUsers} utilisateurs (${Math.round(u.u02.rate * 100)}%)` : "", renderDetail: renderDetail("u02") }),
    mkRule({ ruleKey: "u03", title: "Utilisateurs sans rôle assigné", severity: "avertissement", domainId: d, domainLabel: dl, count: u.u03.length, isEmpty: u.u03.length === 0, description: u.u03.length > 0 ? `${u.u03.length} utilisateurs sans rôle explicite` : "", renderDetail: renderDetail("u03") }),
    mkRule({ ruleKey: "u04", title: "Absence de différenciation des rôles", severity: "avertissement", domainId: d, domainLabel: dl, count: u.u04.triggered ? 1 : 0, isEmpty: !u.u04.triggered, description: u.u04.triggered ? `${Math.round(u.u04.dominantRate * 100)}% des utilisateurs partagent le même rôle` : "", renderDetail: renderDetail("u04") }),
    mkRule({ ruleKey: "u05", title: "Utilisateurs potentiellement inactifs", severity: "critique", domainId: d, domainLabel: dl, count: u.u05.inactiveUsers.length, isEmpty: u.u05.inactiveUsers.length === 0, description: u.u05.inactiveUsers.length > 0 ? `${u.u05.inactiveUsers.length} comptes potentiellement inactifs` : "", renderDetail: renderDetail("u05") }),
    mkRule({ ruleKey: "u06", title: "Équipes vides", severity: "info", domainId: d, domainLabel: dl, count: u.u06.length, isEmpty: u.u06.length === 0, description: u.u06.length > 0 ? `${u.u06.length} équipes sans membre` : "", renderDetail: renderDetail("u06") }),
    mkRule({ ruleKey: "u07", title: "Owners sans objet CRM assigné", severity: "info", domainId: d, domainLabel: dl, count: u.u07.length, isEmpty: u.u07.length === 0, description: u.u07.length > 0 ? `${u.u07.length} owners sans contact, deal ni company` : "", renderDetail: renderDetail("u07") }),
  ];
}

// ─── Deals D-01 à D-15 ──────────────────────────────────────────────────

function flattenDealRules(dd: DealAuditResults, renderDetail: (ruleKey: string) => (() => ReactNode) | undefined): FlatRule[] {
  const d = "deals";
  const dl = "Deals & Pipelines";

  const d04Count = dd.d04.reduce((s, g) => s + g.deals.length, 0);
  const d05Count = dd.d05.reduce((s, g) => s + g.deals.length, 0);

  return [
    mkRule({ ruleKey: "d01", title: "Taux de deals avec montant renseigné", severity: "critique", domainId: d, domainLabel: dl, count: dd.d01.triggered ? 1 : 0, isEmpty: !dd.d01.triggered, description: dd.d01.triggered ? `Seulement ${Math.round(dd.d01.rate * 100)}% de deals avec montant` : "", renderDetail: renderDetail("d01") }),
    mkRule({ ruleKey: "d02", title: "Taux de deals avec date de clôture", severity: "critique", domainId: d, domainLabel: dl, count: dd.d02.triggered ? 1 : 0, isEmpty: !dd.d02.triggered, description: dd.d02.triggered ? `Seulement ${Math.round(dd.d02.rate * 100)}% de deals avec date de clôture` : "", renderDetail: renderDetail("d02") }),
    mkRule({ ruleKey: "d03", title: "Deals ouverts depuis plus de 60 jours", severity: "avertissement", domainId: d, domainLabel: dl, count: dd.d03.length, isEmpty: dd.d03.length === 0, description: dd.d03.length > 0 ? `${dd.d03.length} deals ouverts depuis plus de 60 jours` : "", renderDetail: renderDetail("d03") }),
    mkRule({ ruleKey: "d04", title: "Propriétés obligatoires non renseignées", severity: "critique", domainId: d, domainLabel: dl, count: d04Count, isEmpty: d04Count === 0, description: d04Count > 0 ? `${d04Count} deals avec des propriétés requises manquantes` : "", renderDetail: renderDetail("d04") }),
    mkRule({ ruleKey: "d05", title: "Deals bloqués dans un stage (> 60 jours)", severity: "avertissement", domainId: d, domainLabel: dl, count: d05Count, isEmpty: d05Count === 0, description: d05Count > 0 ? `${d05Count} deals bloqués dans un stage` : "", renderDetail: renderDetail("d05") }),
    mkRule({ ruleKey: "d06", title: "Pipelines sans activité récente", severity: "info", domainId: d, domainLabel: dl, count: dd.d06.length, isEmpty: dd.d06.length === 0, description: dd.d06.length > 0 ? `${dd.d06.length} pipelines potentiellement obsolètes` : "", renderDetail: renderDetail("d06") }),
    mkRule({ ruleKey: "d07", title: "Pipelines avec trop de stages (> 8)", severity: "info", domainId: d, domainLabel: dl, count: dd.d07.length, isEmpty: dd.d07.length === 0, description: dd.d07.length > 0 ? `${dd.d07.length} pipelines avec trop d'étapes` : "", renderDetail: renderDetail("d07") }),
    mkRule({ ruleKey: "d08", title: "Deals sans propriétaire assigné", severity: "info", domainId: d, domainLabel: dl, count: dd.d08.length, isEmpty: dd.d08.length === 0, description: dd.d08.length > 0 ? `${dd.d08.length} deals sans owner` : "", renderDetail: renderDetail("d08") }),
    mkRule({ ruleKey: "d09", title: "Deals sans contact associé", severity: "avertissement", domainId: d, domainLabel: dl, count: dd.d09.length, isEmpty: dd.d09.length === 0, description: dd.d09.length > 0 ? `${dd.d09.length} deals sans contact associé` : "", renderDetail: renderDetail("d09") }),
    mkRule({ ruleKey: "d10", title: "Deals sans company associée", severity: "info", domainId: d, domainLabel: dl, count: !dd.d10.disabled ? dd.d10.deals.length : 0, isEmpty: dd.d10.disabled || dd.d10.deals.length === 0, description: !dd.d10.disabled && dd.d10.deals.length > 0 ? `${dd.d10.deals.length} deals sans company` : "", renderDetail: renderDetail("d10") }),
    mkRule({ ruleKey: "d11", title: "Deals avec montant à 0", severity: "avertissement", domainId: d, domainLabel: dl, count: dd.d11.length, isEmpty: dd.d11.length === 0, description: dd.d11.length > 0 ? `${dd.d11.length} deals avec montant à 0€` : "", renderDetail: renderDetail("d11") }),
    mkRule({ ruleKey: "d12", title: "Pipelines avec phases fréquemment sautées", severity: "avertissement", domainId: d, domainLabel: dl, count: dd.d12.length, isEmpty: dd.d12.length === 0, description: dd.d12.length > 0 ? `${dd.d12.length} pipelines avec des étapes sautées` : "", renderDetail: renderDetail("d12") }),
    mkRule({ ruleKey: "d13", title: "Pipelines avec points d'entrée multiples", severity: "avertissement", domainId: d, domainLabel: dl, count: dd.d13.length, isEmpty: dd.d13.length === 0, description: dd.d13.length > 0 ? `${dd.d13.length} pipelines avec entrées non standard` : "", renderDetail: renderDetail("d13") }),
    mkRule({ ruleKey: "d14", title: "Pipelines avec stages fermés redondants", severity: "avertissement", domainId: d, domainLabel: dl, count: dd.d14.length, isEmpty: dd.d14.length === 0, description: dd.d14.length > 0 ? `${dd.d14.length} pipelines avec des stages fermés en doublon` : "", renderDetail: renderDetail("d14") }),
    mkRule({ ruleKey: "d15", title: "Stages sans activité depuis 90 jours", severity: "info", domainId: d, domainLabel: dl, count: dd.d15.length, isEmpty: dd.d15.length === 0, description: dd.d15.length > 0 ? `${dd.d15.length} stages potentiellement obsolètes` : "", renderDetail: renderDetail("d15") }),
  ];
}

// ─── Leads L-01 à L-14 ──────────────────────────────────────────────────

function flattenLeadRules(l: LeadAuditResults, renderDetail: (ruleKey: string) => (() => ReactNode) | undefined): FlatRule[] {
  const d = "leads";
  const dl = "Leads & Prospection";

  const l02Count = l.l02.reduce((s, g) => s + g.leads.length, 0);

  return [
    mkRule({ ruleKey: "l01", title: "Leads ouverts depuis plus de 30 jours", severity: "avertissement", domainId: d, domainLabel: dl, count: l.l01.length, isEmpty: l.l01.length === 0, description: l.l01.length > 0 ? `${l.l01.length} leads en stagnation` : "", renderDetail: renderDetail("l01") }),
    mkRule({ ruleKey: "l02", title: "Leads bloqués dans un stage (> 30 jours)", severity: "avertissement", domainId: d, domainLabel: dl, count: l02Count, isEmpty: l02Count === 0, description: l02Count > 0 ? `${l02Count} leads bloqués dans un stage` : "", renderDetail: renderDetail("l02") }),
    mkRule({ ruleKey: "l03", title: "Leads sans propriétaire assigné", severity: "info", domainId: d, domainLabel: dl, count: l.l03.length, isEmpty: l.l03.length === 0, description: l.l03.length > 0 ? `${l.l03.length} leads sans owner` : "", renderDetail: renderDetail("l03") }),
    mkRule({ ruleKey: "l04", title: "Leads sans contact associé", severity: "critique", domainId: d, domainLabel: dl, count: l.l04.length, isEmpty: l.l04.length === 0, description: l.l04.length > 0 ? `${l.l04.length} leads sans prospect identifié` : "", renderDetail: renderDetail("l04") }),
    mkRule({ ruleKey: "l05", title: "Pipelines de prospection sans activité récente", severity: "info", domainId: d, domainLabel: dl, count: l.l05.length, isEmpty: l.l05.length === 0, description: l.l05.length > 0 ? `${l.l05.length} pipelines potentiellement obsolètes` : "", renderDetail: renderDetail("l05") }),
    mkRule({ ruleKey: "l06", title: "Pipelines de prospection avec trop de stages (> 5)", severity: "info", domainId: d, domainLabel: dl, count: l.l06.length, isEmpty: l.l06.length === 0, description: l.l06.length > 0 ? `${l.l06.length} pipelines trop complexes` : "", renderDetail: renderDetail("l06") }),
    mkRule({ ruleKey: "l07", title: "Pipelines avec phases fréquemment sautées", severity: "avertissement", domainId: d, domainLabel: dl, count: l.l07.length, isEmpty: l.l07.length === 0, description: l.l07.length > 0 ? `${l.l07.length} pipelines avec des étapes sautées` : "", renderDetail: renderDetail("l07") }),
    mkRule({ ruleKey: "l08", title: "Pipelines avec points d'entrée multiples", severity: "avertissement", domainId: d, domainLabel: dl, count: l.l08.length, isEmpty: l.l08.length === 0, description: l.l08.length > 0 ? `${l.l08.length} pipelines avec entrées non standard` : "", renderDetail: renderDetail("l08") }),
    mkRule({ ruleKey: "l09", title: "Pipelines avec stages fermés redondants", severity: "avertissement", domainId: d, domainLabel: dl, count: l.l09.length, isEmpty: l.l09.length === 0, description: l.l09.length > 0 ? `${l.l09.length} pipelines avec des stages fermés en doublon` : "", renderDetail: renderDetail("l09") }),
    mkRule({ ruleKey: "l10", title: "Stages sans activité depuis 60 jours", severity: "info", domainId: d, domainLabel: dl, count: l.l10.length, isEmpty: l.l10.length === 0, description: l.l10.length > 0 ? `${l.l10.length} stages potentiellement obsolètes` : "", renderDetail: renderDetail("l10") }),
    mkRule({ ruleKey: "l11", title: "Leads disqualifiés sans motif", severity: "avertissement", domainId: d, domainLabel: dl, count: l.l11.triggered ? l.l11.withoutReason : 0, isEmpty: !l.l11.triggered, description: l.l11.triggered ? `${l.l11.withoutReason} leads sans motif sur ${l.l11.totalDisqualified} disqualifiés` : "", renderDetail: renderDetail("l11") }),
    mkRule({ ruleKey: "l12", title: "Motif de disqualification non structuré", severity: "info", domainId: d, domainLabel: dl, count: l.l12.triggered && !l.l12.disabled ? 1 : 0, isEmpty: !l.l12.triggered || l.l12.disabled, description: l.l12.triggered && !l.l12.disabled ? "Le champ de motif est en texte libre au lieu d'une énumération" : "", renderDetail: renderDetail("l12") }),
    mkRule({ ruleKey: "l13", title: "Leads qualifiés sans deal associé", severity: "critique", domainId: d, domainLabel: dl, count: l.l13.triggered ? l.l13.withoutDeal : 0, isEmpty: !l.l13.triggered, description: l.l13.triggered ? `${l.l13.withoutDeal} leads qualifiés sans deal sur ${l.l13.totalQualified} qualifiés` : "", renderDetail: renderDetail("l13") }),
    mkRule({ ruleKey: "l14", title: "Leads sans source d'origine", severity: "avertissement", domainId: d, domainLabel: dl, count: l.l14.length, isEmpty: l.l14.length === 0, description: l.l14.length > 0 ? `${l.l14.length} leads sans source` : "", renderDetail: renderDetail("l14") }),
  ];
}

// ─── Main export ─────────────────────────────────────────────────────────

export interface FlattenOptions {
  propertyResults: AuditResults;
  workflowResults?: WorkflowAuditResults | null;
  contactResults?: ContactAuditResults | null;
  companyResults?: CompanyAuditResults | null;
  userResults?: UserAuditResults | null;
  dealResults?: DealAuditResults | null;
  leadResults?: LeadAuditResults | null;
  auditedDomains?: string[];
  renderDetail: (ruleKey: string) => (() => ReactNode) | undefined;
}

export function flattenAllRules(opts: FlattenOptions): FlatRule[] {
  const {
    propertyResults, workflowResults, contactResults, companyResults,
    userResults, dealResults, leadResults, auditedDomains, renderDetail,
  } = opts;

  const isDomainAudited = (id: string) => !auditedDomains || auditedDomains.includes(id);

  const rules: FlatRule[] = [];

  // Properties (always audited)
  rules.push(...flattenPropertyRules(propertyResults, renderDetail));

  // Contacts
  if (isDomainAudited("contacts") && contactResults?.hasContacts) {
    rules.push(...flattenContactRules(contactResults, renderDetail));
  }

  // Companies
  if (isDomainAudited("companies") && companyResults?.hasCompanies) {
    rules.push(...flattenCompanyRules(companyResults, renderDetail));
  }

  // Workflows
  if (isDomainAudited("workflows") && workflowResults?.hasWorkflows) {
    rules.push(...flattenWorkflowRules(workflowResults, renderDetail));
  }

  // Users
  if (isDomainAudited("users") && userResults?.hasUsers && !userResults.scopeError) {
    rules.push(...flattenUserRules(userResults, renderDetail));
  }

  // Deals
  if (isDomainAudited("deals") && dealResults?.hasDeals) {
    rules.push(...flattenDealRules(dealResults, renderDetail));
  }

  // Leads
  if (isDomainAudited("leads") && leadResults?.hasLeads && !leadResults.scopeError) {
    rules.push(...flattenLeadRules(leadResults, renderDetail));
  }

  return rules;
}
