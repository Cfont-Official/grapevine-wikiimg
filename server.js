import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  const safe = req.query.safe === "true";
  if (!q) return res.status(400).json({ error: "Missing ?q=" });

  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      q
    )}&gsrlimit=20&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

    const r = await fetch(url);
    const data = await r.json();

    const pages = data.query?.pages ? Object.values(data.query.pages) : [];

    let results = pages.map(p => {
      const info = p.imageinfo?.[0];
      return {
        title: p.title,
        thumb: info?.thumburl || info?.url,
        url: info?.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
        license: info?.extmetadata?.LicenseShortName?.value || "Unknown"
      };
    });

    if (safe) {
      const banned = ["nude", "sex", "porn", "explicit", "erotic", "nsfw", "violence"];
      results = results.filter(r =>
        !banned.some(word =>
          r.title.toLowerCase().includes(word)
        )
      );
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => console.log(`✅ Grapevine Wikimedia running on ${PORT}`));
