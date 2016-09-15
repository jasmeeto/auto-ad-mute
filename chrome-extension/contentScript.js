$.fn.exists = function () {
    return this.length !== 0;
}

var videoMuted = false;
var addonEnabled = true;

function runScript() {
    var html5VideoSelector = '.html5-main-video';

    $(html5VideoSelector).on('play', function() {
        if (!addonEnabled) return;

        if ($('.videoAdUi').exists()) {
            if (! $(html5VideoSelector).prop('muted')) {
                $(".ytp-mute-button").click();
            }
            chrome.storage.sync.set({'videoMuted': true}, function(){
                videoMuted = true;
            });
            chrome.runtime.sendMessage({action: 'mute'});
        }
    });

    $(html5VideoSelector).on('ended', function(){
        if (!addonEnabled) return;

        if (videoMuted) {
            if ($(html5VideoSelector).prop('muted')) {
                $(".ytp-mute-button").click();
            }
            chrome.storage.sync.set({'videoMuted': false}, function(){
                videoMuted = false;
            });
            chrome.runtime.sendMessage({action: 'unmute'});
        }
    });

}

function syncSettings() {
    chrome.storage.sync.get(function(items){
        if (chrome.runtime.lastError) {
            return;
        }
        if (items.addonEnabled !== undefined) {
            addonEnabled = items.addonEnabled;
        }
    });
}

chrome.runtime.onMessage.addListener(
    function(req, sender, sendResponse) {
        if (req.action == 'sync') {
            syncSettings();
            return;
        }
        if (req.action == 'restartScript') {
            syncSettings();
            runScript();
            return;
        }
    }
);
