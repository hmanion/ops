import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 8080);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".ndjson": "application/x-ndjson; charset=utf-8"
};

function resolvePath(urlPath) {
  const clean = urlPath.split("?")[0].replace(/\/+$/, "") || "/";
  const mapped = clean === "/" ? "/docs/index.html" : clean;
  const candidate = path.normalize(path.join(root, mapped));
  if (!candidate.startsWith(root)) return null;

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const idx = path.join(candidate, "index.html");
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const filePath = resolvePath(req.url || "/");
  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath);
  const contentType = contentTypes[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}/`);
  console.log("App URL: http://localhost:" + port + "/docs/");
});
