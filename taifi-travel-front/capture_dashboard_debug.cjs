const puppeteer = require('puppeteer');
const path = require('path');

const outDir = 'c:/Users/kadao/Desktop/taifi travel final/rapport/screenshots_dashboard';

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // 1. Login Page
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Login
    await page.type('input[type="text"], input[type="email"], input[placeholder="Username"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    console.log("Waiting for dashboard to load...");
    
    // We will wait specifically for an element we know exists on the dashboard
    try {
        await page.waitForSelector('.sidebar', { timeout: 10000 });
        console.log("Sidebar found! Dashboard loaded successfully.");
    } catch (e) {
        console.log("Timeout waiting for sidebar. The page might be blank or broken.");
        const html = await page.content();
        console.log("PAGE HTML DUMP:", html.substring(0, 500));
    }
    
    await new Promise(r => setTimeout(r, 3000));
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
    
    await page.screenshot({ path: path.join(outDir, '02_admin_dashboard_home_final.png') });
    console.log('Saved 02_admin_dashboard_home_final.png');
    
    await browser.close();
    console.log('Finished capturing screenshot.');
})();
