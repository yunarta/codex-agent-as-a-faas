import http from "node:http";
import handler from "../handler.js";

const port = Number(process.env.PORT || 8081);

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/function/agent-inference") {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "error", message: "Not found" }));
    return;
  }

  let raw = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    raw += chunk;
  });

  req.on("end", async () => {
    const response = await handler({ body: raw }, { status: () => {} });
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
  });
});

server.listen(port, () => {
  console.log(`http demo server listening on ${port}`);
});
