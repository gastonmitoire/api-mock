const http = require("http");
const url = require("url");
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;

const db = "db.json";

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const headers = req.headers;

  if (trimmedPath === "login" && method === "post") {
    const decoded = Buffer.from(headers.authorization.split(" ")[1], "base64")
      .toString()
      .split(":");

    const username = decoded[0];
    const password = decoded[1];

    const dbData = fs.readFileSync(db, "utf8");
    const json = JSON.parse(dbData);

    const user = json.users.find((user) => user.username === username);

    if (user && user.password === password) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message: "Token generado correctamente",
          user: {
            id: user.id,
            username: user.username,
          },
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJhc2QiLCJtZXNzYWdlIjoiRXN0ZSBzZXJpYSBlbCB0b2tlbiBkZXZ1ZWx0byIsImlhdCI6MTUxNjIzOTAyMn0.l7BJWtn3q1IOmliMMO6EbH-_ZT4jk4nhGAxxH96Q5n4",
          expiresIn: "2023-12-31T23:59:59.000Z",
        })
      );
    } else {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Usuario o contraseña incorrectos" }));
    }
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Hello World" }));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
