// Await connection from the content script
chrome.extension.onConnect.addListener(function(port) {
  if (port.name != 'hn-comments') {
    return;
  }
  // Await messages from the content script
  // - If data is empty, content script wants to fetch
  // - If data has contents, content script wants to update
  port.onMessage.addListener(function(data) {
    if (data) {
      // Update to local storage
      localStorage[storageKey] = JSON.stringify(data);
    } else {
      // Fetch from local storage
      var data = localStorage[storageKey] || '';
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = {};
      }
      // Send contents back
      port.postMessage(data);
    }
  });
});
// Local storage key
var storageKey = 'hn-followed-links';