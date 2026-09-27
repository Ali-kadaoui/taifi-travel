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
    const pageClient = await browser.newPage();
    const websiteUrl = 'http://localhost:5174';
    const dashboardUrl = 'http://localhost:5173';
    
    const hideToasts = async (p) => {
        try {
            await p.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
        } catch(e) {}
    };

    console.log("1. Creating client account on website");
    await pageClient.goto(`${websiteUrl}/signup`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await hideToasts(pageClient);
    
    const randomEmail = `approved_${Date.now()}@example.com`;
    await pageClient.type('input[type="email"]', randomEmail);
    await pageClient.type('input[type="password"]', 'password123');
    await pageClient.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 4000));

    console.log("2. Submitting Application");
    await pageClient.goto(`${websiteUrl}/apply`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
    
    // Quick apply via API in browser context
    await pageClient.evaluate(async () => {
        const token = localStorage.getItem('taifi_public_jwt');
        await fetch('http://localhost:5055/api/public/submit-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                firstName: 'Ahmed',
                lastName: 'Approved',
                sex: 'Male',
                dateOfBirth: '1980-01-01',
                cinNumber: 'AA112233',
                applicationType: 'Omra',
                email: 'test@test.com',
                phoneNumber: '0600000000',
                passportDeposited: false,
                photoDeposited: false,
                certificateDeposited: false,
                amountPaid: 0
            })
        });
    });
    console.log("Application submitted via API in browser.");
    await new Promise(r => setTimeout(r, 2000));

    // Now go to Dashboard and approve it
    console.log("3. Logging into Admin Dashboard to approve...");
    const pageAdmin = await browser.newPage();
    await pageAdmin.goto(`${dashboardUrl}/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    
    // AuthModal login
    await pageAdmin.type('input[type="text"]', 'm.alami@example.com');
    await pageAdmin.type('input[type="password"]', 'password123');
    await pageAdmin.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 4000));

    await pageAdmin.goto(`${dashboardUrl}/pending-applications`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 5000));
    
    console.log("Approving application in Admin Dashboard...");
    // Click the first application in the list
    await pageAdmin.evaluate(() => {
        const firstApp = document.querySelector('.bg-white.rounded-xl.p-5.shadow-sm.cursor-pointer');
        if (firstApp) firstApp.click();
    });
    await new Promise(r => setTimeout(r, 3000));
    
    // Click Approve
    await pageAdmin.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const approveBtn = buttons.find(b => b.textContent.includes('Approve') || b.textContent.includes('Approuver'));
        if (approveBtn) approveBtn.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    console.log("4. Back to Client Website My Account");
    await pageClient.goto(`${websiteUrl}/my-account`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    await hideToasts(pageClient);
    
    await pageClient.screenshot({ path: path.join(outDir, '12_my_account_approved.png'), fullPage: true });
    console.log('Saved 12_my_account_approved.png');

    await browser.close();
    console.log('Finished capturing approved state.');
})();
