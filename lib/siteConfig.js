import fs from "fs/promises";
import path from "path";

const file = path.join(process.cwd(), "data", "site.json");

export const defaultSiteConfig = {
  sections: {
    hero: true,
    how: true,
    features: true,
    faq: true
  },
  landing: {
    priceLead: "",
    priceNote: "",
    faq: null
  },
  catalog: {
    enabledPacks: ["food", "cinema", "activities", "drinks", "places"]
  },
  telegram: {
    webhookSetAt: null,
    notes: ""
  },
  updatedAt: null
};

async function readRaw() {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function getSiteConfig() {
  const saved = await readRaw();
  if (!saved) return { ...defaultSiteConfig };
  return {
    ...defaultSiteConfig,
    ...saved,
    sections: { ...defaultSiteConfig.sections, ...(saved.sections || {}) },
    landing: { ...defaultSiteConfig.landing, ...(saved.landing || {}) },
    catalog: { ...defaultSiteConfig.catalog, ...(saved.catalog || {}) },
    telegram: { ...defaultSiteConfig.telegram, ...(saved.telegram || {}) }
  };
}

export async function saveSiteConfig(partial) {
  const current = await getSiteConfig();
  const next = {
    ...current,
    ...partial,
    sections: { ...current.sections, ...(partial.sections || {}) },
    landing: { ...current.landing, ...(partial.landing || {}) },
    catalog: { ...current.catalog, ...(partial.catalog || {}) },
    telegram: { ...current.telegram, ...(partial.telegram || {}) },
    updatedAt: Date.now()
  };
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function publicSiteConfig(config) {
  return {
    sections: config.sections,
    landing: {
      priceLead: config.landing.priceLead || "",
      priceNote: config.landing.priceNote || "",
      faq: config.landing.faq
    },
    catalog: config.catalog
  };
}
