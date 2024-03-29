const puppeteer = require("puppeteer");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
async function start() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.etsy.com/in-en/seller-handbook/category/site-updates"
  );

  const articles = await page.$$(".article-card");
  const articlesArray = [];
  for (const article of articles) {
    try {
      const id = await page.evaluate(
        (el) => el?.getAttribute("data-title-slug")?.split("/")[1],
        article
      );
      const title = await page.evaluate(
        (el) => el.querySelector(".article-card-title")?.innerText,
        article
      );
      const body = await page.evaluate(
        (el) => el.querySelector(".article-card-excerpt")?.innerText,
        article
      );
      const image = await page.evaluate(
        (el) => el.querySelector(".article-card-image")?.getAttribute("src"),
        article
      );

      const date = await page.evaluate(
        (el) =>
          el.querySelector(
            ".article-card > div > div > div > .article-card-body > div > p"
          )?.innerText,
        article
      );

      if (date) {
        articlesArray.push({
          id,
          title,
          image,
          body,
          date,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  await browser.close();
  return articlesArray;
}

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/etsy/site-updates", async (req, res) => {
  try {
    const data = await start();
    return res.status(200).json({
      data,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.toString(),
    });
  }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
