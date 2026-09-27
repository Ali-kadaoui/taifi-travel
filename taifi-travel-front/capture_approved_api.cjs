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
    
    console.log("1. Creating client account on website");
    await pageClient.goto(`${websiteUrl}/signup`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    const randomEmail = `api_approved_${Date.now()}@example.com`;
    await pageClient.type('input[type="email"]', randomEmail);
    await pageClient.type('input[type="password"]', 'password123');
    await pageClient.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 4000));

    console.log("2. Submitting Application and Approving via backend API directly in browser");
    await pageClient.evaluate(async () => {
        const token = localStorage.getItem('taifi_public_jwt');
        
        // 1. Submit
        await fetch('http://localhost:5055/api/public/submit-application', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                firstName: 'Ahmed', lastName: 'API', sex: 'Male', dateOfBirth: '1980-01-01',
                cinNumber: 'AA112233', applicationType: 'Omra', email: 'test@test.com',
                phoneNumber: '0600000000', passportDeposited: false, photoDeposited: false,
                certificateDeposited: false, amountPaid: 0
            })
        });

        // 2. Fetch pending application ID
        const adminRes = await fetch('http://localhost:5055/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'm.alami@example.com', password: 'password123' })
        });
        const adminData = await adminRes.json();
        const adminToken = adminData.token;

        const pendingRes = await fetch('http://localhost:5055/api/pending-applications', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const pendingData = await pendingRes.json();
        
        // Find our app
        const myApp = pendingData.find(a => {
            try { return JSON.parse(a.payloadJson).firstName === 'Ahmed'; } catch(e) { return false; }
        });

        if (myApp) {
            // 3. Approve
            await fetch(`http://localhost:5055/api/pending-applications/${myApp.id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
        }
    });

    console.log("3. Back to Client Website My Account");
    await pageClient.goto(`${websiteUrl}/my-account`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 5000));
    
    try {
        await pageClient.addStyleTag({ content: '.toast-enter, [style*="z-index: 9999"], .Toastify { display: none !important; }' });
    } catch(e) {}

    await pageClient.screenshot({ path: path.join(outDir, '12_my_account_approved.png'), fullPage: true });
    console.log('Saved 12_my_account_approved.png');

    await browser.close();
    console.log('Finished capturing approved state via API.');
})();
