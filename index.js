const express = require("express");
const bodyParser = require("body-parser");
const elasticClient = require("./elastic-client");
require("dotenv").config({ path: ".okta.env" });
var randomWords = require("random-words");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("helloooo");
});

app.post("/create-post", async (req, res) => {
  const result = await elasticClient.index({
    index: "posts",
    document: {
      title: req.body.title,
      author: req.body.author,
      content: req.body.content,
    },
  });

  res.send(result);
});

app.get("/bulk", async (req, res) => {
  for (let index = 0; index < 25000; index++) {
    await elasticClient.index({
      index: "posts",
      document: {
        title: `${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} ${randomWords()} `,
        author: req.body.author,
        content: req.body.content,
      },
    });
  }

  res.send("DONE");
});

app.delete("/remove-post", async (req, res) => {
  const result = await elasticClient.delete({
    index: "posts",
    id: req.query.id,
  });

  res.json(result);
});
app.get("/search", async (req, res) => {
  const result = await elasticClient.search({
    index: "posts",
    query: {
      fuzzy: {
        name: {
          value: req.query.query,
        },
      },
    },
    // query: {
    //   ///starts with
    //   match_phrase_prefix: {
    //     title: {
    //       query: req.query.query,
    //     },
    //   },
    // },
    // query: {
    //   match: { //exact match
    //     title: {
    //       query: req.query.query,
    //     },
    //   },
    // },
  });

  res.json(result);
});
app.get("/posts", async (req, res) => {
  const result = await elasticClient.search({
    index: "posts",
    query: { match_all: {} },
  });

  res.send(result);
});

app.listen(8083, () => {
  console.log("SERVER RUNNING http://localhost:8083");
});
