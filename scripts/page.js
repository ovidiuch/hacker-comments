var register = function(articleUrl, commentUrl) {
  map[articleUrl] = map['last'] = commentUrl;
  // Send updated map of links to background script
  port.postMessage(map);
};
var getCommentUrl = function(anchor) {
  return $(anchor).closest('tr').next().find('a:nth-child(3)').prop('href');
};
// Init empty map of links, that will be populate
// with first message from the background script
var map = {};
// Connect to background script
var port = chrome.extension.connect({name: 'hn-comments'});
// Await messages from the background script
port.onMessage.addListener(function(data) {
  // Populate link map
  map = data;
  // If this is HN, add hooks to article links. Otherwise, if
  // previously visited from HN, add key hooks
  if (window.location.hostname == 'news.ycombinator.com') {
    // Map all 30 links without the "More" one
    $('.title a:lt(30)').click(function() {
      // Store addresses to cookie before following it
      register(this.href, getCommentUrl(this));
    });
    // Map SHIFT+BACKSPACE key combination
    $(document).keyup(function(e) {
      if (e.shiftKey && e.keyCode == 8) {
        e.preventDefault();
        // Redirect to HN listing page
        window.location = '/';
      }
    });
  } else {
    // Attempt to fetch HN comment url based on current location,
    // but also fallback to last forwarded link
    var commentUrl = map[String(window.location)] || map['last'];
    // Ignore page if there's no HN history
    if (!commentUrl) {
      return;
    }
    // Map SHIFT+BACKSPACE key combination
    $(document).keyup(function(e) {
      if (e.shiftKey && e.keyCode == 8) {
        e.preventDefault();
        // Redirect to HN comments page
        window.location = commentUrl;
      }
    });
  }
});
// Ask for initial map of links from background script
port.postMessage(null);