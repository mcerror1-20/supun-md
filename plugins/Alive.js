const os = require("os")
const axios = require('axios')
const config = require('../settings')
const {runtime , sleep} = require('../lib/functions')
const {cmd , commands} = require('../lib/command')

let MDBOT_NAME = "DARK SHADOW MD"
let MD_VERSION = "1.0.0"
let BOT_OWNER = "DARK SHADOW TEAM"
let MD_CAPTAINS = "> ᴍᴀᴅᴇ ʙʏ ᴅᴀʀᴋ ꜱʜᴀᴅᴏᴡ ᴛᴇᴀᴍ"

//================ ALIVE =======================

cmd({
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    react: "👋",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

  const stars = ['✦','✯','✯','✰','◬','✵'];
  const star = stars[Math.floor(Math.random()*stars.length)];
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
    }    
          
let alive = `
╭════〘 ${MDBOT_NAME} 〙═══▣
┇${star}┏╍╍╍╍╍╍╍╍╍╍◈
┇${star}┇
┇${star}┇ *𝖴ꜱᴇʀ : ${pushname}*
┇${star}┇ *𝖮ᴡɴᴇʀ : ${BOT_OWNER}*
┇${star}┇ *𝖬ᴏᴅᴇ : ${config.MODE}*
┇${star}┇ *𝖵ᴇʀꜱɪᴏɴ : ${MD_VERSION}*
┇${star}┇ *𝖱ᴜɴ𝖳ɪᴍᴇ : ${runtime(process.uptime())}*
┇${star}┇ 
┇${star}┇
┇${star}┇  ▎▍▌▌▉▏▎▌▉▐▏▌▎
┇${star}┇  ▎▍▌▌▉▏▎▌▉▐▏▌▎
┇${star}┇ 
┇${star}┗╍╍╍╍╍╍╍╍╍╍◈
╰════════════════════▣

${MD_CAPTAINS}`

await conn.sendMessage(from, { text: alive ,
  contextInfo: {
    mentionedJid: [ '' ],
    groupMentions: [],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363270086174844@newsletter',
      newsletterName: "DARK-SHADOW-MD",
      serverMessageId: 999
    },
externalAdReply: { 
title: 'DARK-SHADOW-MD',
body: `${pushname}`,
mediaType: 1,
sourceUrl: "https://github.com/mrsupunfernando16/DAR-SHADOW-MD-1" ,
thumbnailUrl: "https://i.ibb.co/bHXBV08/9242c844b83f7bf9.jpg" ,
renderLargerThumbnail: true,
showAdAttribution: true
}
}}, { quoted: mek})}catch(e){
console.log(e)
reply(`${e}`)
}
});