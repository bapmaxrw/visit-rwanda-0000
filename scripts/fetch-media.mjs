/**
 * Downloads openly licensed Rwanda photography from Wikimedia Commons.
 * Every file is documented with its Commons file page in MEDIA_CREDITS.md.
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "media");

const files = [
  ["volcanoes.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Volcanoes_National_Park_Rwanda.jpg/1920px-Volcanoes_National_Park_Rwanda.jpg"],
  ["gorilla.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Mountain_gorilla_%28Gorilla_beringei_beringei%29_female_with_baby.jpg/1920px-Mountain_gorilla_%28Gorilla_beringei_beringei%29_female_with_baby.jpg"],
  ["gorilla-portrait.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Mountain_gorilla_%28Gorilla_beringei_beringei%29_eyes.jpg/1920px-Mountain_gorilla_%28Gorilla_beringei_beringei%29_eyes.jpg"],
  ["akagera.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Akagera_National_Park_Rwanda.jpg/1920px-Akagera_National_Park_Rwanda.jpg"],
  ["elephants.jpg", "https://upload.wikimedia.org/wikipedia/commons/a/a5/Elephants_in_Akagera_National_Park_%2801%29.jpg"],
  ["giraffe.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Giraffe_Gathering_Akagera_National_Park.jpg/1920px-Giraffe_Gathering_Akagera_National_Park.jpg"],
  ["nyungwe.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Sunrisenyungwe.jpg/1920px-Sunrisenyungwe.jpg"],
  ["canopy.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Nyungwe_Canopy_Walk.jpg/1920px-Nyungwe_Canopy_Walk.jpg"],
  ["kivu.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Lake_Kivu_at_dawn.jpg/1920px-Lake_Kivu_at_dawn.jpg"],
  ["kivu-boats.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Lake_Kivu_beach_featuring_touring_boats.jpg/1920px-Lake_Kivu_beach_featuring_touring_boats.jpg"],
  ["kigali.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Kigali2018Cropped.jpg/1920px-Kigali2018Cropped.jpg"],
  ["kigali-street.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/High_Angle_View_Of_Kigali_City_Street_on_November_29%2C_2018._Emmanuel_Kwizera.jpg/1920px-High_Angle_View_Of_Kigali_City_Street_on_November_29%2C_2018._Emmanuel_Kwizera.jpg"],
  ["convention.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/An_aerial_of_Kigali_Convention_Center_on_June_19%2C_2019._Photo_by_Emmanuel_Kwizera.jpg/1920px-An_aerial_of_Kigali_Convention_Center_on_June_19%2C_2019._Photo_by_Emmanuel_Kwizera.jpg"],
  ["hills.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Hills_of_Nyamagabe_in_Rwanda.jpg/1920px-Hills_of_Nyamagabe_in_Rwanda.jpg"],
  ["hills-2.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/Holly_Rwanda_Landscape_Image_hills_of_Rwanda.jpg/1920px-Holly_Rwanda_Landscape_Image_hills_of_Rwanda.jpg"],
  ["culture.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Intore_Performance.jpg/1920px-Intore_Performance.jpg"],
  ["culture-2.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Intore_mu_Rwanda.jpg/1920px-Intore_mu_Rwanda.jpg"],
  ["king-palace.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/King%27s_Palace_Museum%2C_Nyanza_06.jpg/1920px-King%27s_Palace_Museum%2C_Nyanza_06.jpg"],
  ["memorial.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Kigali_Memorial_Centre_3.jpg/1920px-Kigali_Memorial_Centre_3.jpg"],
  ["inema.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Inema_Art_Center.jpg/1920px-Inema_Art_Center.jpg"],
  ["gishwati.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Cloudy_in_Gishwati_Mukura_Mountains.jpg/1920px-Cloudy_in_Gishwati_Mukura_Mountains.jpg"],
  ["heritage-hut.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Traditional_hut.jpg/1920px-Traditional_hut.jpg"],
  ["crafts.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Amahembee.jpg/1920px-Amahembee.jpg"],
  ["bamboo.jpg", "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/A_Park_ranger_with_AK-47_Machine_gun_in_a_bamboo_forest_%2C_Volcanoes_National_Park_Rwanda._Emmanuel_Kwizera.jpg/1920px-A_Park_ranger_with_AK-47_Machine_gun_in_a_bamboo_forest_%2C_Volcanoes_National_Park_Rwanda._Emmanuel_Kwizera.jpg"],
];

await fs.mkdir(OUT, { recursive: true });

const results = await Promise.all(
  files.map(async ([name, url]) => {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "VisitRwandaAcademy/1.0 (media import)" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(path.join(OUT, name), buf);
      return `${name} ${(buf.length / 1024).toFixed(0)}KB`;
    } catch (err) {
      return `${name} FAILED ${err.message}`;
    }
  })
);
console.log(results.join("\n"));
