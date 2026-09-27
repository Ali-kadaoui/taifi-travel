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
    await page.screenshot({ path: path.join(outDir, '01_login_page.png') });
    console.log('Saved 01_login_page.png');
    
    // Login
    await page.type('input[type="text"], input[type="email"], input[placeholder="Username"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for Dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    // 2. Dashboard Overview
    await page.screenshot({ path: path.join(outDir, '02_admin_dashboard_home.png') });
    console.log('Saved 02_admin_dashboard_home.png');
    
    // 3. Client Database (List)
    await page.goto('http://localhost:5173/clients');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '03_client_database.png') });
    console.log('Saved 03_client_database.png');
    
    // Try to click the first client to view details (Double comptabilité)
    try {
        const clientRow = await page.$('table tbody tr, .client-card, .list-item');
        if (clientRow) {
            await clientRow.click();
            await new Promise(r => setTimeout(r, 2000));
            await page.screenshot({ path: path.join(outDir, '04_client_details_identity.png') });
            console.log('Saved 04_client_details_identity.png');
            
            // Try to click travel tab
            const tabs = await page.$$('button[role="tab"], .tab, button.tab-button');
            if (tabs.length > 1) {
                await tabs[1].click();
                await new Promise(r => setTimeout(r, 1000));
                await page.screenshot({ path: path.join(outDir, '05_client_details_travel.png') });
                console.log('Saved 05_client_details_travel.png');
            }
            if (tabs.length > 2) {
                await tabs[2].click();
                await new Promise(r => setTimeout(r, 1000));
                await page.screenshot({ path: path.join(outDir, '06_client_details_hotel.png') });
                console.log('Saved 06_client_details_hotel.png');
            }
        }
    } catch (e) {
        console.log('Could not navigate to client details', e.message);
    }
    
    // 4. Pending Applications
    await page.goto('http://localhost:5173/pending-applications');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '07_pending_applications.png') });
    console.log('Saved 07_pending_applications.png');
    
    // 5. Travel Campaigns
    await page.goto('http://localhost:5173/campaigns');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '08_travel_campaigns.png') });
    console.log('Saved 08_travel_campaigns.png');
    
    // 6. Hotels
    await page.goto('http://localhost:5173/hotels');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '09_hotels_management.png') });
    console.log('Saved 09_hotels_management.png');
    
    // 7. Scanner Registration (QR Code)
    await page.goto('http://localhost:5173/scanner');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '10_scanner_pairing.png') });
    console.log('Saved 10_scanner_pairing.png');
    
    // 8. Staff Permissions
    await page.goto('http://localhost:5173/permissions');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '11_staff_permissions.png') });
    console.log('Saved 11_staff_permissions.png');
    
    await browser.close();
    console.log('Finished capturing screenshots.');
})();
