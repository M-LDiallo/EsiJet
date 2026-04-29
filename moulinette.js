const fs = require('fs');
const path = require('path');
const https = require('https');

console.log("⏳ Téléchargement de la base de données mondiale des aéroports...");

// Lien direct vers la base open-source la plus fiable du web
const url = "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json";

https.get(url, (res) => {
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
        try {
            const data = JSON.parse(body);
            const rawAirports = Object.values(data);

            // On filtre pour ne garder que les VRAIS aéroports commerciaux (ceux qui ont un code IATA)
            const formattedAirports = rawAirports
                .filter(a => a.iata && a.iata !== '\\N' && a.iata !== '')
                .map(a => ({
                    code: a.iata,
                    name: a.name,
                    city: a.city || a.name,
                    country: a.country,
                    coords: [parseFloat(a.lat), parseFloat(a.lon)] // Conversion en nombre
                }));

            // On va écraser ton fichier src/data/airports.json avec ces milliers de résultats
            const filePath = path.join(__dirname, 'src', 'data', 'airports.json');
            fs.writeFileSync(filePath, JSON.stringify(formattedAirports, null, 2));

            console.log(`✅ MAGIQUE ! ${formattedAirports.length} aéroports ont été injectés dans src/data/airports.json`);
        } catch (error) {
            console.error("❌ Erreur de formatage :", error.message);
        }
    });
}).on("error", (error) => {
    console.error("❌ Erreur de téléchargement :", error.message);
});