// starts on document start ...

$.fn.exists = function () {
    return this.length !== 0;
}
var videoMuted = false;
var addonEnabled = true;
var skipAds = false;
var html5VideoSelector = '.html5-main-video';

// idempotent listener attaching script for html5 video element
function runScript() {
    var muteButtonSelector = '.ytp-mute-button';
    var videoAdSelector = '.videoAdUi';
    var videoAdSelectorM = '.ytp-ad-player-overlay';
    var videoSkipButtonSelector = '.videoAdUiSkipButton';
    var adContainerSelector = '.ad-container';
    var namespace = ".autoAdMute";

    var onTimeUpdate = function() {
        if (!addonEnabled) return;
        // check if need for muting on every time update
        if(this.currentTime > 0.0
            && ($(videoAdSelector).exists() || (location.href.indexOf("music.youtube.com") >= 0 && $(videoAdSelectorM).exists()))
            && !videoMuted) {
            onPlay();
        }

        // skip ad if possible and enabled on every time update
        if (skipAds) {
            $(videoSkipButtonSelector).click();
        }
        // also move ad banner off screen if it exists
        $(adContainerSelector).css("position", "absolute").css("left", -9999);
    }

    var onPlay = function() {
        if (!addonEnabled) return;

        var exists = $(videoAdSelector).exists() || (location.href.indexOf("music.youtube.com") >= 0 && $(videoAdSelectorM).exists());
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

    // remove listeners if existing
    $(html5VideoSelector).off(namespace);

    $(html5VideoSelector).on('timeupdate' + namespace, onTimeUpdate);
    $(html5VideoSelector).on('play' + namespace, onPlay);
    $(html5VideoSelector).on('playing' + namespace, onPlay);
}

// load settings from chrome storage into variables in scope
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
        if (items.videoMuted !== undefined) {
            videoMuted = items.videoMuted;
        }
        if (typeof callback === "function") {
            callback();
        }
    });
}

// reloads settings and runs main script 
function restartScript() {
    syncSettings(function(){
        runScript();
    });
}

// listens for events/actions from runtime
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

// first sync storage and mute if necessary
syncSettings(function() {
    if (!addonEnabled) return;
    chrome.storage.sync.set({'videoMuted': true}, function(){
        videoMuted = true;
    });
    chrome.runtime.sendMessage({action: 'mute'});
});

// check if video elem is loaded
if (!$(html5VideoSelector).exists()) {
    //wait until we see html video element before we add listeners
    document.arrive(html5VideoSelector, function(){
        restartScript(); 
    });
} else {
    restartScript();
}
