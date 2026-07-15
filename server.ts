import express from "express";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";

// Recursive helper to add workspace folder to source zip
function addFolderToZip(zip: AdmZip, currentDir: string, relativePath: string = "") {
  const items = fs.readdirSync(currentDir);
  for (const item of items) {
    const localPath = path.join(currentDir, item);
    const relPath = relativePath ? `${relativePath}/${item}` : item;

    // Exclusions for source export
    if (
      item === "node_modules" ||
      item === "dist" ||
      item === ".git" ||
      item === ".env" ||
      item === "bun.lock" ||
      item === "test-hash.js"
    ) {
      continue;
    }

    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      addFolderToZip(zip, localPath, relPath);
    } else {
      // Get the directory path inside the zip (with forward slashes for cross-platform compatibility)
      const zipDir = relativePath ? relativePath.replace(/\\/g, "/") : "";
      zip.addLocalFile(localPath, zipDir);
    }
  }
}

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

  // Endpoint to export compiled site specifically for Altervista
  app.get("/api/export/altervista", async (req, res) => {
    try {
      const distPath = path.join(process.cwd(), "dist");
      
      // Check if dist directory exists and is compiled
      if (!fs.existsSync(distPath) || fs.readdirSync(distPath).length === 0) {
        return res.status(400).json({
          error: "Il sito non è ancora stato compilato. Avvia la compilazione prima di esportare.",
          suggestion: "Fai clic su 'Compila Applet' o attendi che la build sia completata."
        });
      }

      const zip = new AdmZip();
      
      // Add all compiled files in 'dist' to the ZIP root
      function addDistToZip(dir: string, relPath: string = "") {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const localPath = path.join(dir, item);
          const relativeItemPath = relPath ? `${relPath}/${item}` : item;
          const stat = fs.statSync(localPath);
          
          if (stat.isDirectory()) {
            addDistToZip(localPath, relativeItemPath);
          } else {
            const zipDir = relPath ? relPath.replace(/\\/g, "/") : "";
            zip.addLocalFile(localPath, zipDir);
          }
        }
      }
      
      addDistToZip(distPath);

      // Make sure the PHP proxy is at the root
      const proxyPhpPath = path.join(process.cwd(), "public", "proxy-image.php");
      if (fs.existsSync(proxyPhpPath)) {
        const entry = zip.getEntry("proxy-image.php");
        if (!entry) {
          zip.addLocalFile(proxyPhpPath, "");
        }
      }

      // Add detailed Italian setup instructions
      const instructionsContent = `====================================================================
GUIDA ALL'INSTALLAZIONE DEL SITO DI LAURA PAUSINI SU ALTERVISTA
====================================================================

Questo archivio contiene tutti i file del sito compilati e pronti per essere pubblicati su Altervista, inclusi i sistemi per aggirare il blocco del caricamento delle immagini (hotlink) di Wikipedia.

CONTENUTO DELL'ARCHIVIO:
1. File HTML, JS e CSS (nella cartella principale e in "assets/") - Rappresentano il design, la musica, i testi e le animazioni del fan site.
2. proxy-image.php - Script PHP che fa da "ponte" (proxy) per caricare in modo sicuro le immagini delle copertine e dei concerti di Laura Pausini da Wikipedia, evitando blocchi (errore 403) e rallentamenti (errore 429).
3. ISTRUZIONI_ALTERVISTA.txt - Questo manuale di istruzioni.

--------------------------------------------------------------------
COME PUBBLICARE IL SITO SU ALTERVISTA (Passo dopo passo):
--------------------------------------------------------------------

OPZIONE A: Caricamento tramite il Pannello di Gestione di Altervista (Consigliato per semplicità)
1. Accedi al tuo account Altervista (https://www.altervista.org).
2. Vai nel "Pannello di Controllo" -> "Gestione File" (o "File Manager").
3. Assicurati di trovarti nella cartella principale (root, solitamente indicata con un'icona di una casa o "/").
4. Clicca sul pulsante "Invia file" o "Carica" (Upload).
5. Seleziona tutti i file estratti da questo archivio ZIP:
   - index.html (il file principale)
   - proxy-image.php (indispensabile per le immagini)
   - la cartella "assets" con tutto il suo contenuto (contiene i file Javascript e CSS compilati)
6. Attendi il completamento del caricamento.
7. Visita il tuo indirizzo (es. http://tuonome.altervista.org) e goditi il sito completo di Laura Pausini!

OPZIONE B: Caricamento tramite Client FTP (FileZilla, Cyberduck, ecc.)
1. Scarica e installa un client FTP come FileZilla.
2. Usa le credenziali FTP fornite da Altervista in fase di registrazione:
   - Host: ftp.tuonome.altervista.org
   - Username: tuonome
   - Password: La tua password di Altervista
   - Port: 21
3. Una volta connesso, trascina tutti i file estratti da questo ZIP nella cartella principale del server remoto (di solito la cartella vuota iniziale).
4. Attendi che il trasferimento di tutti i file (specialmente quelli dentro "assets/") sia completato.

--------------------------------------------------------------------
NOTE IMPORTANTI SUL PROXY IMMAGINI (proxy-image.php):
--------------------------------------------------------------------
Il fan site utiliza immagini d'archivio di Wikipedia Commons. Per evitare che Wikipedia blocchi il tuo sito per "hotlinking" (mostrando un'icona di immagine rotta), abbiamo configurato il sito per instradare le immagini attraverso lo script "proxy-image.php".
Lo script PHP:
- Recupera l'immagine originale sul server tramite cURL o file_get_contents.
- Utilizza la rete CDN ad alta velocità di WordPress (Photon CDN) per ridurre il carico sul tuo server Altervista ed evitare blocchi di rate-limiting.
- Memorizza temporaneamente nella cache l'immagine per garantire un caricamento istantaneo.

Non cancellare il file "proxy-image.php", altrimenti le immagini del sito non saranno visibili!

Grazie per aver utilizzato lo strumento di esportazione. Se riscontri problemi, assicurati di aver caricato l'intera cartella "assets" intatta senza rinominare alcun file.
Buona pubblicazione!
====================================================================`;

      zip.addFile("ISTRUZIONI_ALTERVISTA.txt", Buffer.from(instructionsContent, "utf-8"));

      const zipBuffer = zip.toBuffer();
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=\"sito-laura-pausini-altervista.zip\"");
      res.send(zipBuffer);
    } catch (error) {
      console.error("Errore nell'esportazione di Altervista:", error);
      res.status(500).send("Errore durante la creazione dell'esportazione");
    }
  });

  // Endpoint to export the full source code workspace as a ZIP file
  app.get("/api/export/source", async (req, res) => {
    try {
      const zip = new AdmZip();
      addFolderToZip(zip, process.cwd());
      
      const zipBuffer = zip.toBuffer();
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=\"sito-completo-sorgente.zip\"");
      res.send(zipBuffer);
    } catch (error) {
      console.error("Errore nell'esportazione sorgente:", error);
      res.status(500).send("Errore durante la creazione del file zip sorgente");
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
