
chrome.runtime.onMessage.addListener(
    function(req, sender, sendResponse) {
        if (req.action == "mute") {
            chrome.tabs.update(sender.tab.id, {muted: true});
            chrome.browserAction.setIcon({
                path: 'icon_mute.png',
            }); 
            return;
        }
        if (req.action == "unmute") {
            chrome.tabs.update(sender.tab.id, {muted: false});
            chrome.browserAction.setIcon({
                path: 'icon.png'
            }); 
            return;
        }
    }
);
