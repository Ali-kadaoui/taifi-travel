const puppeteer = require('puppeteer');
const path = require('path');

const outDir = 'c:/Users/kadao/Desktop/taifi travel final/rapport/screenshots_dashboard';

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();
    
    // Go to root, which will render AuthModal if not logged in
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Login
    await page.type('input[type="text"], input[type="email"], input[placeholder="Username"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    console.log("Waiting for dashboard sidebar to load...");
    
    // Wait for the sidebar to ensure we are logged in and dashboard is rendered
    await page.waitForSelector('.sidebar', { timeout: 15000 });
    console.log("Sidebar found! Dashboard loaded successfully.");
    
    // Wait extra time for the charts and data to fetch
    await new Promise(r => setTimeout(r, 4000));
    
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
    
    await page.screenshot({ path: path.join(outDir, '02_admin_dashboard_home_final.png') });
    console.log('Saved 02_admin_dashboard_home_final.png');
    
    await browser.close();
    console.log('Finished capturing screenshot.');
})();
