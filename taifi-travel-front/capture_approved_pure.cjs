const puppeteer = require('puppeteer');
const path = require('path');

const outDir = 'c:/Users/kadao/Desktop/taifi travel final/rapport/screenshots_website_full';

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        defaultViewport: { width: 1440, height: 1000 }
    });
    const pageClient = await browser.newPage();
    
    // Quick API login to generate a valid token
    console.log("Authenticating...");
    const token = await pageClient.evaluate(async () => {
        // Authenticate with the first approved application's email or just create a new one
        const rand = Date.now();
        await fetch('http://localhost:5055/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `test_${rand}@test.com`, password: 'password123' })
        });
        const res = await fetch('http://localhost:5055/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `test_${rand}@test.com`, password: 'password123' })
        });
        const data = await res.json();
        
        // Submit an application
        await fetch('http://localhost:5055/api/public/submit-application', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` },
            body: JSON.stringify({
                firstName: 'Ahmed', lastName: 'Approved', sex: 'Male',
                dateOfBirth: '1980-01-01', cinNumber: 'AA112233', applicationType: 'Omra',
                email: 'test@test.com', phoneNumber: '0600000000', passportDeposited: false,
                photoDeposited: false, certificateDeposited: false, amountPaid: 0
            })
        });

        // Admin login and approve
        const adminRes = await fetch('http://localhost:5055/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'm.alami@example.com', password: 'password123' })
        });
        const adminData = await adminRes.json();
        const pendingRes = await fetch('http://localhost:5055/api/pending-applications', {
            headers: { 'Authorization': `Bearer ${adminData.token}` }
        });
        const pendingData = await pendingRes.json();
        const myApp = pendingData.find(a => a.email === 'test@test.com' || a.payloadJson.includes('Ahmed'));
        if (myApp) {
            await fetch(`http://localhost:5055/api/pending-applications/${myApp.id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${adminData.token}` }
            });
        }
        
        return data.token;
    });

    console.log("Setting token and navigating...");
    await pageClient.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
    await pageClient.evaluate((token) => {
        localStorage.setItem('taifi_public_jwt', token);
    }, token);

    await pageClient.goto('http://localhost:5174/my-account', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    
    console.log("Taking screenshot...");
    await pageClient.screenshot({ path: path.join(outDir, '12_my_account_approved_final.png') });
    console.log("Done.");
    await browser.close();
    process.exit(0);
})();
