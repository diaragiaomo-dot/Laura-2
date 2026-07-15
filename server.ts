import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Server-side Image Proxy Route to bypass Wikipedia Hotlink Blocking
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).send("Missing image URL");
      }

      const decodedUrl = decodeURIComponent(imageUrl);
      let targetUrl = decodedUrl;

      // Handle known broken/deleted Wikipedia URLs
      if (targetUrl.includes("Laura_Pausini_2018.jpg")) {
        targetUrl = "https://upload.wikimedia.org/wikipedia/commons/a/af/Laura_Pausini_Inedito_World_Tour.jpg";
      } else if (targetUrl.includes("Laura_Pausini_live_2018.jpg")) {
        targetUrl = "https://upload.wikimedia.org/wikipedia/commons/a/af/Laura_Pausini_Inedito_World_Tour.jpg";
      } else if (targetUrl.includes("Laura_Pausini_Sanremo_2022.jpg")) {
        targetUrl = "https://upload.wikimedia.org/wikipedia/commons/6/6c/Laura_Pausini_viveme.jpg";
      }

      // If it is a Wikipedia commons image, route it through the WordPress Photon CDN to prevent 429 Too Many Requests rate-limiting
      if (targetUrl.includes("upload.wikimedia.org")) {
        const cleanTarget = targetUrl.replace(/^https?:\/\//, "");
        targetUrl = `https://i0.wp.com/${cleanTarget}`;
      }
      
      // Fetch with standard headers
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "LauraPausiniFanSite/1.0 (contact: diaragiacomo24@gmail.com) Node/fetch",
          "Accept": "image/*, */*"
        }
      });

      if (!response.ok) {
        console.warn(`Proxy fetch failed with status ${response.status} for URL: ${targetUrl}`);
        // Redirect to a high-quality, stable Unsplash music placeholder to avoid broken image frames
        return res.redirect("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500");
      }

      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }
      
      // Cache-Control to prevent repeated fetches and optimize performance
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error) {
      console.error("Proxy image error:", error);
      res.status(500).send("Error proxying image");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
