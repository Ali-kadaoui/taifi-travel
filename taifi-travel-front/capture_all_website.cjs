const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = 'c:/Users/kadao/Desktop/taifi travel final/rapport/screenshots_website_full';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        defaultViewport: { width: 1440, height: 1000 }
    });
    const page = await browser.newPage();
    const baseUrl = 'http://localhost:5174';
    
    // Hide toast notifications function
    const hideToasts = async () => {
        try {
            await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
        } catch(e) {}
    };

    console.log("1. Home");
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '01_home.png'), fullPage: true });

    console.log("2. About");
    await page.goto(`${baseUrl}/about`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '02_about.png'), fullPage: true });

    console.log("3. Packages");
    await page.goto(`${baseUrl}/packages`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '03_packages.png'), fullPage: true });

    console.log("4. Package Details (Clicking first package)");
    try {
        const packageCard = await page.$('a[href^="/package/"]');
        if (packageCard) {
            await packageCard.click();
            await new Promise(r => setTimeout(r, 4000));
            await hideToasts();
            await page.screenshot({ path: path.join(outDir, '04_package_details.png'), fullPage: true });
        } else {
            console.log("No package cards found.");
        }
    } catch(e) { console.log(e); }

    console.log("5. Hotels");
    await page.goto(`${baseUrl}/hotels`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '05_hotels.png'), fullPage: true });

    console.log("6. Hotel Details (Clicking first hotel)");
    try {
        const hotelCard = await page.$('a[href^="/hotel/"]');
        if (hotelCard) {
            await hotelCard.click();
            await new Promise(r => setTimeout(r, 4000));
            await hideToasts();
            await page.screenshot({ path: path.join(outDir, '06_hotel_details.png'), fullPage: true });
        } else {
            console.log("No hotel cards found.");
        }
    } catch(e) { console.log(e); }

    console.log("7. Contact");
    await page.goto(`${baseUrl}/contact`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '07_contact.png'), fullPage: true });

    console.log("8. Application Form");
    await page.goto(`${baseUrl}/apply`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '08_apply.png'), fullPage: true });

    console.log("9. Login / Signup (Signup view)");
    await page.goto(`${baseUrl}/signup`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '09_signup.png'), fullPage: true });

    console.log("10. Creating account to access My Account...");
    const randomEmail = `testuser${Date.now()}@example.com`;
    await page.type('input[type="email"]', randomEmail);
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 4000));

    console.log("11. My Account (Dashboard)");
    await page.goto(`${baseUrl}/my-account`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '10_my_account.png'), fullPage: true });

    await browser.close();
    console.log('Finished capturing all website screenshots.');
})();
