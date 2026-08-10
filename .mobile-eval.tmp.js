const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3001/';

(async () => {
  const browser = await chromium.launch({ headless: false });
  try {
    const page = await browser.newPage();
    const sizes = [
      { n: 'desktop', w: 1440, h: 1000 },
      { n: 'tablet', w: 768, h: 900 },
      { n: 'm320', w: 320, h: 740 },
      { n: 'm375', w: 375, h: 812 },
      { n: 'm430', w: 430, h: 932 },
    ];

    for (const v of sizes) {
      await page.setViewportSize({ width: v.w, height: v.h });
      await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      const data = await page.evaluate(() => {
        const q = (s) => document.querySelector(s);
        const rect = (e) => {
          if (!e) return null;
          const r = e.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
        };
        const details = q('.faq-item details');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          newsCount: document.querySelectorAll('.news-card-horizontal').length,
          news: rect(q('.news-card-horizontal')),
          summary: rect(q('.faq-item summary')),
          detailsOpen: details?.open ?? null,
          faqCount: document.querySelectorAll('.faq-item').length,
        };
      });
      let opened = null;
      if (await page.locator('.faq-item summary').count()) {
        await page.locator('.faq-item summary').first().click();
        opened = await page.locator('.faq-item details').first().evaluate((e) => e.open);
      }
      await page.screenshot({
        path: `C:/Users/drif8/AppData/Local/Temp/azz-mobile-q0r3i5g5.nwa/${v.n}.png`,
        fullPage: true,
      });
      console.log(JSON.stringify({ viewport: v, ...data, opened }));
    }
  } finally {
    await browser.close();
  }
})();
