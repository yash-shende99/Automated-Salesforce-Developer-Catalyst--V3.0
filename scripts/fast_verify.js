const http = require('http');
const { verifyChallenge } = require('./challenge_verifier');

async function fastVerify(unitUrl) {
    const encodedUrl = encodeURIComponent(unitUrl);
    
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:4567/verify?url=${encodedUrl}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ success: false, error: 'Invalid response from daemon' });
                }
            });
        });

        req.on('error', async () => {
            console.log('[FastVerify] Daemon not running on port 4567. Falling back to direct verifier...');
            const result = await verifyChallenge(unitUrl);
            resolve(result);
        });

        req.setTimeout(65000, () => {
            req.destroy();
            resolve({ success: false, error: 'Request timed out' });
        });
    });
}

if (require.main === module) {
    const url = process.argv[2];
    if (!url) {
        console.error('Usage: node scripts/fast_verify.js <unit_url>');
        process.exit(1);
    }
    fastVerify(url).then(res => {
        console.log(JSON.stringify(res, null, 2));
    });
}

module.exports = { fastVerify };
