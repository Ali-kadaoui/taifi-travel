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
    
    const hideToasts = async () => {
        try {
            await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
        } catch(e) {}
    };

    console.log("1. Creating account / Logging in");
    await page.goto(`${baseUrl}/signup`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await hideToasts();
    const randomEmail = `client${Date.now()}@example.com`;
    await page.type('input[type="email"]', randomEmail);
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 4000));

    console.log("2. My Account");
    await page.goto(`${baseUrl}/my-account`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '10_my_account_loggedin.png'), fullPage: true });

    console.log("3. Contact Us (Logged In)");
    await page.goto(`${baseUrl}/contact`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
    await hideToasts();
    await page.screenshot({ path: path.join(outDir, '07_contact_loggedin.png'), fullPage: true });

    console.log("4. Application Form (Steps)");
    // Clear localStorage step just in case
    await page.evaluate(() => localStorage.removeItem('appFormStep'));
    await page.goto(`${baseUrl}/apply`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
    await hideToasts();

    // Step 1
    await page.screenshot({ path: path.join(outDir, '08_apply_step1.png'), fullPage: true });
    console.log('Saved 08_apply_step1.png');
    // Fill step 1
    await page.type('input[name="firstName"]', 'Mohammed');
    await page.type('input[name="lastName"]', 'Alami');
    await page.type('input[name="cinNumber"]', 'AB123456');
    await page.type('input[name="dateOfBirth"]', '1985-05-15');
    // click radio
    await page.evaluate(() => { document.querySelector('input[value="Male"]').click(); });
    // Submit form to go to next step
    await page.evaluate(() => { document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); });
    await new Promise(r => setTimeout(r, 1000));

    // Step 2
    await page.screenshot({ path: path.join(outDir, '08_apply_step2.png'), fullPage: true });
    console.log('Saved 08_apply_step2.png');
    // Fill step 2
    await page.type('input[name="email"]', randomEmail);
    await page.type('input[name="phoneNumber"]', '+212600000000');
    await page.evaluate(() => { document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); });
    await new Promise(r => setTimeout(r, 1000));

    // Step 3
    await page.screenshot({ path: path.join(outDir, '08_apply_step3.png'), fullPage: true });
    console.log('Saved 08_apply_step3.png');
    // Select first campaign if available
    try {
        const campaign = await page.$('.flex-row > div.cursor-pointer');
        if (campaign) await campaign.click();
    } catch(e) {}
    await page.evaluate(() => { document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); });
    await new Promise(r => setTimeout(r, 1000));

    // Step 4
    await page.screenshot({ path: path.join(outDir, '08_apply_step4.png'), fullPage: true });
    console.log('Saved 08_apply_step4.png');
    await page.evaluate(() => { document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); });
    await new Promise(r => setTimeout(r, 1000));

    // Step 5
    await page.screenshot({ path: path.join(outDir, '08_apply_step5.png'), fullPage: true });
    console.log('Saved 08_apply_step5.png');

    await browser.close();
    console.log('Finished capturing redo screenshots.');
})();
