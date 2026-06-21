// Servidor estático mínimo para visualizar o site OFFLINE (pasta ./out).
// Uso: npm run build  &&  npm run preview   ->   http://localhost:4321
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "out");
const port = parseInt(process.env.PORT || "4321", 10);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".json": "application/json",
  ".txt": "text/plain",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    let fp = path.join(root, p);
    if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
      const alt = path.join(root, p, "index.html");
      fp = fs.existsSync(alt) ? alt : path.join(root, "404.html");
    }
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("404");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(fp)] || "application/octet-stream",
      });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log("\n  AERISX — preview offline em  http://localhost:" + port + "\n");
  });
