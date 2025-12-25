const express = require('express');
const fs = require('fs-extra');
const fsPromises = require('fs/promises'); // For reading file content
const { exec } = require("child_process");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const crypto = require('crypto'); // For generating a unique ID

// Remove the unused upload import from './mega'
// const { upload } = require('./mega'); 

let router = express.Router();

const MESSAGE = `
*⚠️ Dont share this code with anyone*

*⦁ Github :*  _https://github.com/THEMISADAS2007_
 
*⦁ Follow us :* _https://whatsapp.com/channel/0029Vb1Db0LCsU9SUsOXuC3c_

*⦁ Beta test :* _https://chat.whatsapp.com/Gf78Kc7H1C2AQtya0awEtj?mode=ems_copy_t_

> © 𝚅𝙸𝚂𝙿𝙴𝚁 𝙼𝙳`;

// ✅ Use dynamic import for Baileys (ESM support)
async function loadBaileys() {
    return await import('@whiskeysockets/baileys');
}

// ----------------------------------------------------
// NEW FUNCTION TO UPLOAD TO GITHUB
// ----------------------------------------------------

/**
 * Uploads the session file to a private GitHub repository.
 * The file name (without extension) is returned as the session ID.
 * * Assumes the following environment variables are set:
 * - GITHUB_TOKEN: Your Personal Access Token (PAT) with 'repo' scope.
 * - GH_REPO_OWNER: The GitHub username or organization owning the repo.
 * - GH_REPO_NAME: The name of the repository.
 */
async function uploadToGitHub(filePath, credsFile) {
    const GITHUB_TOKEN = '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';
    const GH_REPO_OWNER = 'THEMISADAS2007';
    const GH_REPO_NAME = 'SESSION-DB';
    const GH_BRANCH = process.env.GH_BRANCH || 'main'; // Default branch is 'main'

    if (!GITHUB_TOKEN || !GH_REPO_OWNER || !GH_REPO_NAME) {
        console.error("GitHub credentials not set in environment variables!");
        throw new Error("GitHub credentials missing for upload.");
    }

    // 1. Generate a unique session ID which will be the file name base.
    // The name will incorporate 'NADEEN-MD' and a UUID.
    const uniqueId = crypto.randomUUID();
    const sessionId = `${uniqueId}`;
    const targetPath = `${filePath}/${sessionId}.json`; // e.g., sessions/NADEEN-MD_... .json

    try {
        // 2. Read the credentials file and encode it in Base64
        const fileContent = await fsPromises.readFile(credsFile);
        const contentBase64 = fileContent.toString('base64');

        // 3. GitHub API endpoint for creating/updating file content
        const apiUrl = `https://api.github.com/repos/${GH_REPO_OWNER}/${GH_REPO_NAME}/contents/${targetPath}`;
        
        const payload = {
            message: `🤖 ADD: Baileys Session for ${sessionId}`,
            content: contentBase64,
            branch: GH_BRANCH,
        };

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'NADEEN-MD-Session-Generator'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`✅ Session uploaded successfully to GitHub as: ${targetPath}`);
            // Return the unique file name (which is the required session ID)
            return sessionId; 
        } else {
            const errorData = await response.json();
            console.error(`GitHub API Error (${response.status}):`, errorData);
            throw new Error(`GitHub upload failed: ${errorData.message || 'Unknown error'}`);
        }

    } catch (error) {
        console.error("Error during GitHub file commit:", error);
        throw error;
    }
}

// ----------------------------------------------------

// Ensure the directory is empty on startup
if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send({ error: 'Please provide ?number=your_whatsapp_number' });

    const {
        default: makeWASocket,
        useMultiFileAuthState,
        delay,
        makeCacheableSignalKeyStore,
        Browsers,
        DisconnectReason
    } = await loadBaileys();

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

        try {
            const Smd = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!Smd.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) {
                    // Send the pairing code to the HTTP response
                    res.send({ code });
                }
            }

            Smd.ev.on('creds.update', saveCreds);

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(10000);

                        if (fs.existsSync('./auth_info_baileys/creds.json')) {
                            const auth_path = './auth_info_baileys';
                            const creds_file = `${auth_path}/creds.json`;
                            const phoneNumber = num.replace(/[^0-9]/g, '');
                            const userJid = `${phoneNumber}@s.whatsapp.net`;

                            // ----------------------------------------------------
                            // ✅ NEW GITHUB UPLOAD LOGIC
                            // ----------------------------------------------------
                            // Upload credentials to GitHub and get the file name as the session ID
                            const sessionId = await uploadToGitHub('sessions', creds_file); // 'sessions' is the folder path in the repo
                            
                            console.log("✅ Session ID (File Name) Generated:", sessionId);

                            // ✅ Send only session ID first
                            // The prefix is adjusted to match the expected format for NADEEN-MD
                            const finalSessionIdText = `VISPER-MD&${sessionId}`;
                            const sentMsg = await Smd.sendMessage(userJid, { text: finalSessionIdText });

                            // ✅ Then send custom success message (quoted)
                            await Smd.sendMessage(userJid, { text: MESSAGE }, { quoted: sentMsg });

                            await delay(2000);
                            
                        }
                    } catch (e) {
                        console.log("Error during GitHub upload or message send: ", e);
                        // Send error back if headers haven't been sent yet (e.g., if pairing code failed)
                        if (!res.headersSent) res.send({ error: "Session generated but failed to upload to GitHub. Check server logs." });
                    } finally {
                        // Cleanup the local session directory regardless of success/failure
                        Smd.ev.removeAllListeners();
                        Smd.end();
                        fs.emptyDirSync(__dirname + '/auth_info_baileys');
                    }
                }

                // Handle connection closures
                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        // The original code uses 'pm2 restart qasim', which I will keep for consistency
                        console.log('Connection closed with bot. Restarting...');
                        exec('pm2 restart qasim');
                    }
                }
            });

        } catch (err) {
            console.log("Error in SUHAIL function: ", err);
            exec('pm2 restart qasim');
            fs.emptyDirSync(__dirname + '/auth_info_baileys');
            if (!res.headersSent) res.send({ code: "Try After Few Minutes" });
        }
    }

    await SUHAIL();
});

module.exports = router;
