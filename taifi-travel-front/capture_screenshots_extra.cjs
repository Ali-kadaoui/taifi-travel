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
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });

    // Login
    await page.type('input[type="text"], input[type="email"], input[placeholder="Username"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for Dashboard to load and fetch data
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 6000)); // Ensure data is fetched!
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
    
    // 2. Dashboard Overview
    await page.screenshot({ path: path.join(outDir, '02_admin_dashboard_home_fixed.png') });
    console.log('Saved 02_admin_dashboard_home_fixed.png');
    
    // 3. Edit / Creation Menus
    // Client Creation
    await page.goto('http://localhost:5173/clients/edit/new');
    await new Promise(r => setTimeout(r, 4000));
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
    await page.screenshot({ path: path.join(outDir, '03_client_creation_menu.png') });
    console.log('Saved 03_client_creation_menu.png');

    // Campaign Creation
    await page.goto('http://localhost:5173/campaigns/edit/new');
    await new Promise(r => setTimeout(r, 4000));
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
    await page.screenshot({ path: path.join(outDir, '04_campaign_creation_menu.png') });
    console.log('Saved 04_campaign_creation_menu.png');

    // Hotel Creation
    await page.goto('http://localhost:5173/hotels/edit/new');
    await new Promise(r => setTimeout(r, 4000));
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
    await page.screenshot({ path: path.join(outDir, '05_hotel_creation_menu.png') });
    console.log('Saved 05_hotel_creation_menu.png');

    // Staff Permissions 
    await page.goto('http://localhost:5173/permissions');
    await new Promise(r => setTimeout(r, 5000)); // wait for list to populate
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
    await page.screenshot({ path: path.join(outDir, '06_staff_permissions_menu.png') });
    console.log('Saved 06_staff_permissions_menu.png');
    
    await browser.close();
    console.log('Finished capturing additional screenshots with no errors.');
})();
