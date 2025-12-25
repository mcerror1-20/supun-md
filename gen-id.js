/**
 * දී ඇති දිගකින් යුත් අහඹු අක්ෂර මාලාවක් (Random String) ජනනය කරයි.
 *
 * @param {number} [num=10] - ජනනය කළ යුතු අක්ෂර මාලාවේ දිග.
 * @returns {string} - අහඹු අක්ෂර මාලාව.
 */
export function makeid(num = 10) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  
  for (let i = 0; i < num; i++) {
    // characters9 වෙනුවට charactersLength භාවිතා කරනු ලැබේ.
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
