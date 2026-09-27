const puppeteer = require('puppeteer');
const path = require('path');

const outDir = 'c:/Users/kadao/Desktop/taifi travel final/rapport/screenshots_website';

// Ensure directory exists
const fs = require('fs');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        defaultViewport: { width: 1440, height: 1000 }
    });
    const page = await browser.newPage();
    
    // 1. Home Page
    console.log("Navigating to home page...");
    await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(outDir, '09_website_home.png') });
    console.log('Saved 09_website_home.png');
    
    // 2. Application Form
    console.log("Navigating to application form...");
    await page.goto('http://localhost:5174/apply', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(outDir, '10_website_application_form.png') });
    console.log('Saved 10_website_application_form.png');
    
    // 3. Client Dashboard (My Account)
    console.log("Signing up to access My Account...");
    await page.goto('http://localhost:5174/signup', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Generate a random email to avoid duplicate errors
    const randomEmail = `testuser${Date.now()}@example.com`;
    await page.type('input[type="email"]', randomEmail);
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Go to my account
    console.log("Navigating to My Account...");
    await page.goto('http://localhost:5174/my-account', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(outDir, '11_website_client_dashboard.png') });
    console.log('Saved 11_website_client_dashboard.png');

    await browser.close();
    console.log('Finished capturing website screenshots.');
})();
