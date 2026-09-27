const puppeteer = require('puppeteer');
const path = require('path');

const outDir = 'c:/Users/kadao/Desktop/taifi travel final/rapport/screenshots_dashboard';

(async () => {
    // It's sometimes better to not use headless for screenshotting React charts, 
    // or just use headless: false if something is breaking, but headless: "new" usually works.
    const browser = await puppeteer.launch({ 
        headless: "new", 
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();
    
    // 1. Login Page
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Hide toasts globally
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });

    // Login
    await page.type('input[type="text"], input[type="email"], input[placeholder="Username"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // We cannot use networkidle because the React app has setIntervals polling the API!
    console.log("Waiting for dashboard to load...");
    await new Promise(r => setTimeout(r, 4000)); // wait exactly 4 seconds
    
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
    
    // 2. Dashboard Overview
    await page.screenshot({ path: path.join(outDir, '02_admin_dashboard_home_final.png') });
    console.log('Saved 02_admin_dashboard_home_final.png');
    
    // 3. Staff Permissions 
    console.log("Navigating to permissions...");
    await page.goto('http://localhost:5173/permissions', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000)); // wait exactly 4 seconds
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
    await page.screenshot({ path: path.join(outDir, '06_staff_permissions_menu_final.png') });
    console.log('Saved 06_staff_permissions_menu_final.png');
    
    await browser.close();
    console.log('Finished capturing screenshots.');
})();
