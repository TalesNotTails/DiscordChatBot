const puppeteer = require("puppeteer");

async function scrapeDice(url_params) {
  const url = new URL("https://www.dice.com/jobs");
  url.search = new URLSearchParams(url_params).toString();

  console.log(url.toString());

  const browser = await puppeteer.launch({
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();

  await page.goto(url.toString());

  await page.waitForNavigation({ waitUntil: "networkidle0" });

  const jobLinks = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll(".card-title-link.normal")
    );
    return links.map((link) => link.id);
  });

  // for debugging
  //   await page.screenshot({ path: "example.png" });

  await browser.close();

  return jobLinks;
}

module.exports = scrapeDice;
