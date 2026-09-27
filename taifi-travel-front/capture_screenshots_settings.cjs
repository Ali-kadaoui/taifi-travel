const puppeteer = require('puppeteer');
const path = require('path');

const outDir = 'c:/Users/kadao/Desktop/taifi travel final/rapport/screenshots_dashboard';

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();
    
    // 1. Login Page
    await page.goto('http://localhost:5173/login');
    await new Promise(r => setTimeout(r, 2000));
    
    // Hide toasts globally
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });

    // Login
    await page.type('input[type="text"], input[type="email"], input[placeholder="Username"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Settings Page
    try {
        await page.goto('http://localhost:5173/settings');
        await new Promise(r => setTimeout(r, 4000));
        await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
        await page.screenshot({ path: path.join(outDir, '08_agency_settings.png') });
        console.log('Saved 08_agency_settings.png');
    } catch(e) { console.log('Error:', e); }
    
    await browser.close();
    console.log('Finished capturing settings screenshot.');
})();
