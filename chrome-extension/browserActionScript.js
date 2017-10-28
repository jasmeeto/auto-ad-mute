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
    var skipAds = false;

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
            $('#disable-button').text('Disable');
        } else {
            chrome.browserAction.setIcon({
                path: 'icon_disabled.png',
            }); 
            $('#disable-button').text('Enable');
        }

        skipAdText = skipAds ? 'Disable Ad Skip' : 'Enable Ad Skip';
        $('#skip-ad').text(skipAdText);
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

        if(items.skipAds !== undefined) {
            skipAds = items.skipAds;
        }
        updateUi();
    });

    $('#disable-button').on('click', function(){
        chrome.storage.sync.set({'addonEnabled': !enabled}, function(){
            if (chrome.runtime.lastError) return;

            enabled = !enabled;
            updateUi();
            sendToAllTabs({action: 'sync'});
        });
    });

    $('#skip-ad').on('click', function(){
        chrome.storage.sync.set({'skipAds': !skipAds}, function(){
            if (chrome.runtime.lastError) return;

            skipAds = !skipAds;
            updateUi();
            sendToAllTabs({action: 'sync'});
        });
    });
});