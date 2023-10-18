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
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOjEsInVzZXJuYW1lIjoiYXNkIiwibWVzc2FnZSI6IkVzdGUgc2VyaWEgZWwgdG9rZW4gZGV2dWVsdG8iLCJpYXQiOjE1MTYyMzkwMjJ9.ELyHZAbjeMB_B68sh6ElQJab1xxxhP_Q-6BB73tNZZA",
          expiresIn: "2023-12-31T23:59:59.000Z",
        })
      );
    } else {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Usuario o contraseña incorrectos" }));
    }
  } else if (trimmedPath === "getProducts" && method === "get") {
    const token = headers.authorization.split(" ")[1];

    if (
      token ===
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWQiOjEsInVzZXJuYW1lIjoiYXNkIiwibWVzc2FnZSI6IkVzdGUgc2VyaWEgZWwgdG9rZW4gZGV2dWVsdG8iLCJpYXQiOjE1MTYyMzkwMjJ9.ELyHZAbjeMB_B68sh6ElQJab1xxxhP_Q-6BB73tNZZA"
    ) {
      const dbData = fs.readFileSync(db, "utf8");
      const json = JSON.parse(dbData);

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(json.products));
    } else {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Usuario no autorizado" }));
    }
  } else if (trimmedPath === "checkout" && method === "post") {
    let body = [];

    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      body = Buffer.concat(body).toString();

      try {
        const requestBody = JSON.parse(body);

        const { userId, products } = requestBody;

        const dbData = fs.readFileSync(db, "utf8");
        const json = JSON.parse(dbData);

        const user = json.users.find((user) => user.id === userId);

        if (user) {
          const invalidProducts = products.filter(({ id }) => {
            return !json.products.some((product) => product.id === id);
          });

          if (invalidProducts.length === 0) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                message: "Orden generada correctamente",
              })
            );
          } else {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                message: "Algunos productos no existen en la base de datos",
                invalidProducts,
              })
            );
          }
        } else {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Usuario no autorizado" }));
        }
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Solictud inválida" }));
      }
    });
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Hello World" }));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
