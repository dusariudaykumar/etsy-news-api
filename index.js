const puppeteer = require("puppeteer");
const express = require("express");

async function start() {
  const browser = await puppeteer.launch();
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

const app = express();

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
const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
