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
    await new Promise(r => setTimeout(r, 3000));
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
    
    // Hotel Creation
    try {
        await page.goto('http://localhost:5173/hotels/edit/new');
        await new Promise(r => setTimeout(r, 4000));
        await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
        await page.screenshot({ path: path.join(outDir, '05_hotel_creation_menu_v2.png') });
        console.log('Saved 05_hotel_creation_menu_v2.png');
    } catch(e) { console.log('Error 05:', e); }

    // Staff Permissions 
    try {
        await page.goto('http://localhost:5173/permissions');
        await new Promise(r => setTimeout(r, 4000)); 
        await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
        await page.screenshot({ path: path.join(outDir, '06_staff_permissions_menu_v2.png') });
        console.log('Saved 06_staff_permissions_menu_v2.png');
    } catch(e) { console.log('Error 06:', e); }
    
    // Client Details Double Compta
    try {
        await page.goto('http://localhost:5173/clients');
        await new Promise(r => setTimeout(r, 4000));
        const clientRow = await page.$('table tbody tr, .client-card, .list-item, tr');
        if (clientRow) {
            await clientRow.click();
            await new Promise(r => setTimeout(r, 3000));
            await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"] { display: none !important; }' });
            await page.screenshot({ path: path.join(outDir, '07_client_details_double_compta_v2.png') });
            console.log('Saved 07_client_details_double_compta_v2.png');
        }
    } catch (e) {
        console.log('Could not navigate to client details', e.message);
    }
    
    await browser.close();
    console.log('Finished capturing remainder of screenshots.');
})();
