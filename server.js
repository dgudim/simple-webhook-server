import express from "express";
import routes from "./routes.js";
import bodyparser from "body-parser";
// App
const app = express();


app.use(bodyparser.json());

// Set port
const port = process.env.PORT || "1337";
app.set("port", port);

app.use("/", routes);

// Server
app.listen(port, () => console.log(`Server running on localhost:${port}`));
