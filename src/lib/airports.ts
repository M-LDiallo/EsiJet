import airportsJson from "@/data/airports.json";

export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
  vip?: boolean;
  coords: [number, number];
};

// On prépare la liste complète avec la logique VIP dès l'import
export const allAirports: Airport[] = airportsJson.map((airport) => ({
  ...airport,
  vip: ["France", "Switzerland", "United Arab Emirates", "United Kingdom"].includes(
    airport.country
  ),
}));

/**
 * Recherche les aéroports par code, ville, nom ou pays
 * Les résultats sont triés par ordre alphabétique de ville.
 */
export function searchAirports(query: string): Airport[] {
  const q = query.trim().toLowerCase();

  // Si la recherche est vide, on renvoie tout (ou une sélection par défaut)
  if (!q) return allAirports;

  return allAirports
    .filter((airport) =>
      airport.code.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      airport.country.toLowerCase().includes(q)
    )
    // Tri alphabétique par ville pour un affichage propre
    .sort((a, b) => a.city.localeCompare(b.city));
}

/**
 * Récupère un aéroport spécifique via son code IATA (ex: LBG)
 */
export function getAirportByCode(code: string): Airport | undefined {
  return allAirports.find(
    (airport) => airport.code.toLowerCase() === code.toLowerCase()
  );
}