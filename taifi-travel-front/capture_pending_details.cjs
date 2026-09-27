const puppeteer = require('puppeteer');
const path = require('path');

const outDir = 'c:/Users/kadao/Desktop/taifi travel final/rapport/screenshots_dashboard';

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();
    
    // Login Page
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Hide toasts globally
    await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });

    // Login
    await page.type('input[type="text"], input[type="email"], input[placeholder="Username"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 4000));
    
    // Navigate to Pending Applications
    console.log("Navigating to pending applications...");
    await page.goto('http://localhost:5173/pending-applications', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000)); // wait for list to load
    
    // Click the first application in the list to reveal the details panel
    try {
        const firstApp = await page.$('.review-list');
        if (firstApp) {
            await firstApp.click();
            await new Promise(r => setTimeout(r, 2000)); // wait for details to render
            
            await page.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
            
            // Take screenshot of the entire page showing the selected application details
            await page.screenshot({ path: path.join(outDir, '07_pending_applications_details.png') });
            console.log('Saved 07_pending_applications_details.png');
        } else {
            console.log("No pending applications found to click.");
        }
    } catch (e) {
        console.log('Error clicking application:', e);
    }
    
    await browser.close();
    console.log('Finished capturing pending details screenshot.');
})();
