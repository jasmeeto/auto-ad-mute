
chrome.runtime.onMessage.addListener(
    function(req, sender, sendResponse) {
        if (req.action == "mute_icon") {
            chrome.browserAction.setIcon({
                path: 'icon_mute.png',
            }); 
            return;
        }
        if (req.action == "unmute_icon") {
            chrome.browserAction.setIcon({
                path: 'icon.png'
            }); 
            return;
        }
    }
);