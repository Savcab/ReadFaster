// // listens for update for pages that dynamically update
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     if (changeInfo.status === "complete" && tab.url.includes("mail.google.com")) {
//       chrome.tabs.executeScript(tabId, { file: "content_scripts.js" });
//       chrome.tabs.insertCSS(tabId, { file: "../test.css" });
//     }
// });  