const http = require("http");
const url = require("url");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const hostname = "127.0.0.1";
const port = 3000;

const db = "db.json";

const corsOptions = {
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

const server = http.createServer((req, res) => {
  cors(corsOptions)(req, res, () => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");
    const method = req.method.toLowerCase();
    const headers = req.headers;

    if (trimmedPath === "v1/login" && method === "post") {
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
            token: jwt.sign(
              {
                sub: user.id,
                iat: Math.floor(Date.now() / 1000),
                username: user.username,
                message: "Este es un mensaje secreto",
              },
              "secret"
            ),
          })
        );
      } else {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({ message: "Usuario o contraseña incorrectos" })
        );
      }
    } else if (trimmedPath === "v1/getProducts" && method === "get") {
      try {
        const token = headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, "secret");

        const dbData = fs.readFileSync(db, "utf8");
        const json = JSON.parse(dbData);

        const user = json.users.find((user) => user.id === decoded.sub);

        if (user) {
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
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Token JWT inválido" }));
        } else {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Error interno del servidor" }));
        }
      }
    } else if (trimmedPath === "v1/checkout" && method === "post") {
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
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
