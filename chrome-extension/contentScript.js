$.fn.exists = function () {
    return this.length !== 0;
}

var videoMuted = false;
var addonEnabled = true;

function runScript() {
    var html5VideoSelector = '.html5-main-video';
    var muteButtonSelector = '.ytp-mute-button';
    var videoAdSelector = '.videoAdUi';
    var videoSkipButtonSelector = '.videoAdUiSkipButton';

    // unmute at start of script
    if ($(html5VideoSelector).prop('muted')) {
        $(muteButtonSelector).click();
    }

    $(html5VideoSelector).on('timeupdate', function() {
        if (!addonEnabled) return;
        // skip ad if possible on every time update
        $(videoSkipButtonSelector).click()
    });

    function onPlay() {
        if (!addonEnabled) return;

        var exists = $(videoAdSelector).exists();
        if (exists) {
            if (! $(html5VideoSelector).prop('muted')) {
                $(muteButtonSelector).click();
            }
            chrome.storage.sync.set({'videoMuted': true}, function(){
                videoMuted = true;
            });
            chrome.runtime.sendMessage({action: 'mute'});
        } else if (videoMuted) {
            if ($(html5VideoSelector).prop('muted')) {
                $(muteButtonSelector).click();
            }
            chrome.storage.sync.set({'videoMuted': false}, function(){
                videoMuted = false;
            });
            chrome.runtime.sendMessage({action: 'unmute'});
        }
    }

    $(html5VideoSelector).on('play', onPlay);
    $(html5VideoSelector).on('playing', onPlay);
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
            chrome.storage.sync.set({'videoMuted': false }, function(){
                chrome.runtime.sendMessage({action: 'unmute'});
                videoMuted = false;
                runScript();
            });
            return;
        }
    }
);
