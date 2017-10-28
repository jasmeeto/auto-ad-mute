
$.fn.exists = function () {
    return this.length !== 0;
}

var videoMuted = false;
var addonEnabled = true;
var skipAds = false;
var html5VideoSelector = '.html5-main-video';

function runScript() {
    var muteButtonSelector = '.ytp-mute-button';
    var videoAdSelector = '.videoAdUi';
    var videoSkipButtonSelector = '.videoAdUiSkipButton';
    var adContainerSelector = '.ad-container';


    $(html5VideoSelector).on('timeupdate', function() {
        if (!addonEnabled) return;
        // check if need for muting on every time update
        if(this.currentTime > 0.0
            && $(videoAdSelector).exists()
            && !videoMuted) {
            onPlay();
        }
        // skip ad if possible and enabled on every time update
        if (skipAds) {
            $(videoSkipButtonSelector).click();
        }
        // also move ad banner off screen if it exists
        $(adContainerSelector).css("position", "absolute").css("left", -9999);
    });

    function onPlay() {
        if (!addonEnabled) return;
        console.log('onPlay');

        var exists = $(videoAdSelector).exists();
        if (exists) {
            chrome.storage.sync.set({'videoMuted': true}, function(){
                videoMuted = true;
            });
            chrome.runtime.sendMessage({action: 'mute'});
        } else if (videoMuted) {
            chrome.storage.sync.set({'videoMuted': false}, function(){
                videoMuted = false;
            });
            chrome.runtime.sendMessage({action: 'unmute'});
        }
    }

    $(html5VideoSelector).on('play', onPlay);
    $(html5VideoSelector).on('playing', onPlay);
}

function syncSettings(callback) {
    chrome.storage.sync.get(function(items){
        if (chrome.runtime.lastError) {
            return;
        }
        if (items.addonEnabled !== undefined) {
            addonEnabled = items.addonEnabled;
        }
        if (items.skipAds !== undefined) {
            skipAds = items.skipAds;
        }
        if (typeof callback === "function") {
            callback();
        }
    });
}

function restartScript() {
    syncSettings(function(){
        runScript();
    });
}

chrome.runtime.onMessage.addListener(
    function(req, sender, sendResponse) {
        if (req.action == 'sync') {
            syncSettings(function() {
                if(addonEnabled) {
                    if (!videoMuted) {
                        chrome.runtime.sendMessage({action: 'unmute'});
                    }
                } else {
                    if (videoMuted) {
                        chrome.storage.sync.set({'videoMuted': false}, function(){
                            videoMuted = false;
                        });
                        chrome.runtime.sendMessage({action: 'unmute'});
                    }
                }
            });
            return;
        }
        if (req.action == 'restartScript') {
            restartScript();
            return;
        }
    }
);

syncSettings(function() {
    if (!addonEnabled) return;

    chrome.runtime.sendMessage({action: 'mute'});
});

if (!$(html5VideoSelector).exists()) {
    //wait until we see html video element before we add listeners
    document.arrive(html5VideoSelector, function(){
        restartScript(); 
    });
} else {
    restartScript();
}
