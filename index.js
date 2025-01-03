const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

async function scrapeHospitals() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  await page.goto("https://howlongwilliwait.com/", { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const hospitals = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#hospitalContainer .grid-item'));
    return items.reduce((data, item, i) => {
      if (i % 3 === 0) {
        data.push({
          name: item.innerText,
          wait_time: items[i + 1]?.innerText || "N/A",
        });
      }
      return data;
    }, []);
  });
  
  await browser.close();
  return hospitals;
}

app.get('/scrape', async (req, res) => {
  try {
    const data = await scrapeHospitals();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running. Use /scrape endpoint to get hospital data.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});