
chrome.runtime.onMessage.addListener(
    function(req, sender, sendResponse) {
        if (req.action == "mute") {
            chrome.browserAction.setIcon({
                path: 'icon_mute.png',
            }); 
            return;
        }
        if (req.action == "unmute") {
            chrome.browserAction.setIcon({
                path: 'icon.png'
            }); 
            return;
        }
    }
);

// To handle youtube video page
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    if(details.frameId === 0) {
        // Fires only when details.url === currentTab.url
        chrome.tabs.get(details.tabId, function(tab) {
            if(tab.url === details.url) {
                chrome.tabs.sendMessage(tab.id, {action: 'restartScript'});
            }
        });
    }
});