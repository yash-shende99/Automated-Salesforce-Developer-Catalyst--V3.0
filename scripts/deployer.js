const { execSync } = require('child_process');

function deployMetadata(targetMetadata = null) {
    try {
        let cmd = 'sf project deploy start --json';
        if (targetMetadata) {
            cmd += ` --metadata "${targetMetadata}"`;
        }
        console.log(`Running deploy: ${cmd}`);
        const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        const result = JSON.parse(output);
        return { success: result.status === 0, result };
    } catch (err) {
        let errJson = null;
        try {
            errJson = JSON.parse(err.stdout || err.output?.[1] || '{}');
        } catch (e) {
            // raw text error
        }
        return {
            success: false,
            error: err.message,
            details: errJson || (err.stderr ? err.stderr.toString() : err.stdout ? err.stdout.toString() : String(err))
        };
    }
}

module.exports = { deployMetadata };

if (require.main === module) {
    const metaArg = process.argv[2] || null;
    const res = deployMetadata(metaArg);
    console.log(JSON.stringify(res, null, 2));
}
