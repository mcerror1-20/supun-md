// qr.js

// required for github interaction (using Octokit library)
const { Octokit } = require('@octokit/rest'); 

// --- GITHUB CONFIGURATION ---
const GITHUB_TOKEN = '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'; 
const GITHUB_OWNER = 'THEMISADAS2007';
const GITHUB_REPO = 'SESSION-DB'; 
const GITHUB_PATH = process.env.GITHUB_PATH || 'sessions'; // default path එක

const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const pino = require("pino");
const path = require('path');

// --- LOCAL MODULES ---
// Random ID Generator function
function makeid(length = 10) { // Default length 10 set karala thiyenawa
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// --- BOT INFO ---
const botRepoUrl = "https://github.com/tharusha-md2008";
const Wachannellink = "https://whatsapp.com/channel/0029Vb9LTRHInlqISdCfln45";

// --- BAILEYS IMPORT ---
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
} = require("@whiskeysockets/baileys");

let router = express.Router();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    // Using fs.rmSync directly to ensure removal
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    // Generate a unique ID for the session folder
    const id = makeid();
    // **NEW RANDOM ID FOR STRING SESSION** - K48OANENvp wage eka
    const randomSessionId = makeid(10).toUpperCase(); 
    
    // Initialize Octokit client
    const octokit = new Octokit({
        auth: GITHUB_TOKEN
    });

    async function GIFTED_MD_PAIR_CODE() {
        // Using native CJS __dirname and path.join for robust path construction
        const authPath = path.join(__dirname, 'temp', id);
        
        // Ensure 'temp' directory exists
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        const {
            state,
            saveCreds
        } = await useMultiFileAuthState(authPath);
        
        try {
            var items = ["Safari"]; 
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomItem = selectRandomItem(items); 

            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({
                    level: "silent"
                }),
                browser: Browsers.macOS("Desktop"),
            });

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect,
                    qr
                } = s;
                
                if (qr && !res.headersSent) {
                    await res.end(await QRCode.toBuffer(qr));
                }
                
                if (connection == "open") {
                    await delay(5000);
                    
                    const credsFilePath = path.join(authPath, 'creds.json');
                    
                    if (!fs.existsSync(credsFilePath)) {
                        console.error("creds.json not found after successful connection.");
                        await sock.ws.close();
                        await removeFile(authPath);
                        return;
                    }
                    
                    try {
                        // 1. Read the creds.json content
                        const credsContent = fs.readFileSync(credsFilePath, 'utf8');
                        // 2. Base64 encode the content
                        const base64Content = Buffer.from(credsContent).toString('base64');
                        
                        // 3. Define the file path in the GitHub repository 
                        // **NOTE**: GitHub eke save wena file eke nama WA ID eka athulata randomSessionId eka ekathu karanawa.
                        // (E.g., sessions/9471xxxxxxx_K48OANENvp.json)
                        const githubFilePath = `${GITHUB_PATH}/${randomSessionId}.json`; 
                        
                        // 4. Save to GitHub using Octokit
                        let sha = undefined;
                        try {
                            const { data } = await octokit.repos.getContent({
                                owner: GITHUB_OWNER,
                                repo: GITHUB_REPO,
                                path: githubFilePath,
                            });
                            sha = data.sha;
                        } catch (e) {
                            if (e.status !== 404) {
                                console.error("Error checking file existence in GitHub:", e);
                            }
                        }

                        const githubSaveResult = await octokit.repos.createOrUpdateFileContents({
                            owner: GITHUB_OWNER,
                            repo: GITHUB_REPO,
                            path: githubFilePath,
                            message: `Session: ${randomSessionId}`, // Commit message ekata random ID eka denawa
                            content: base64Content,
                            sha: sha,
                        });

                        // 5. Send the Random ID as the string_session (as requested)
                        // **ME KOTASE TAMA STRING SESSION EKA HADANNE**
                        const string_session = `VISPER-MD&${randomSessionId}`; // E.g., VISPER-MD&K48OANENvp
                        
                        let md = string_session;
                        const botNumber = sock.user.id.split(':')[0]
                        let code = await sock.sendMessage(botNumber, { text: md });
                        
                        let desc = `
*⚠️ Dont share this code with anyone*

*⦁ Github :*  _https://github.com/THEMISADAS2007_
 
*⦁ Follow us :* _https://whatsapp.com/channel/0029Vb1Db0LCsU9SUsOXuC3c_

*⦁ Beta test :* _https://chat.whatsapp.com/Gf78Kc7H1C2AQtya0awEtj?mode=ems_copy_t_

> © 𝚅𝙸𝚂𝙿𝙴𝚁 𝙼𝙳`;
                        
                        await sock.sendMessage(botNumber, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "VISPER-MD",
                                    thumbnailUrl: "https://files.catbox.moe/ao7d7w.jpg",
                                    sourceUrl: Wachannellink,
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        }, { quoted: code });
                        
                    } catch (e) {
                        console.error("GitHub Save/Message Send Error:", e);
                        
                        let ddd = await sock.sendMessage(sock.user.id, { text: "Session upload failed. Check logs." });
                        
                        let desc = `*\`VISPER-MD\` Session Connected ✅*\n\n⚠️ *ᴅᴏɴᴛ ꜱʜᴀʀᴇ ᴛʜɪꜱ ᴄᴏᴅᴇ ᴡɪᴛʜ ᴀɴʏᴏɴᴇ.*\n\n*───────────────*\n🌟 *\`sᴛᴀʀ ʀᴇᴘᴏ:\`* ${botRepoUrl}\n🔔 *\`ғᴏʟʟᴏᴡ ᴡᴀ-ᴄʜᴀɴɴᴇʟ:\`* ${Wachannellink}\n👤 *\`ᴏᴡɴᴇʀ ɴᴏ:\`* 94740326138\n*───────────────*\n\n> *© ᴘᴏᴡᴇʀᴅ ʙʏ | VISPER ᴏꜰᴄ*`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "VISPER-MD",
                                    thumbnailUrl: "https://files.catbox.moe/ao7d7w.jpg",
                                    sourceUrl: Wachannellink,
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: ddd });
                    }
                    
                    await delay(10);
                    await sock.ws.close();
                    await removeFile(authPath);
                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
                    await delay(10);
                    process.exit(0); 
                    
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Session initialization failed:", err);
            await removeFile(path.join(__dirname, 'temp', id));
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }
    
    await GIFTED_MD_PAIR_CODE();
});

setInterval(() => {
    console.log("☘️ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...");
    process.exit(0);
}, 180000); // 3 minutes

module.exports = router;

