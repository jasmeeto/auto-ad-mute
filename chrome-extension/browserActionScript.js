$(document).ready(function(){

    function sendToAllTabs(message, callback) {
        chrome.tabs.query({}, function(tabs) {
            for (var i=0; i<tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, message, callback);
            }
        });
    }

    var enabled = true;
    var videoMuted = false;

    function updateUi() {
        if (enabled) {
            if (videoMuted) {
                chrome.browserAction.setIcon({
                    path: 'icon_mute.png',
                });
            } else {
                chrome.browserAction.setIcon({
                    path: 'icon.png',
                });
            }
            $('.button-toggle').text('Disable');
        } else {
            chrome.browserAction.setIcon({
                path: 'icon_disabled.png',
            }); 
            $('.button-toggle').text('Enable');
        }
    }

    chrome.storage.sync.get(function(items){
        if (chrome.runtime.lastError) {
            return;
        }
        if (items.addonEnabled !== undefined) {
            enabled = items.addonEnabled;
        }

        if (items.videoMuted !== undefined) {
            videoMuted = items.videoMuted;
        }
        updateUi();
    });

    $('.button-toggle').on('click', function(){
        chrome.storage.sync.set({'addonEnabled': !enabled, videoMuted: false}, function(){
            if (chrome.runtime.lastError) return;

            enabled = !enabled;
            videoMuted = false;
            updateUi();
            sendToAllTabs({action: 'sync'});
        });
    });
});