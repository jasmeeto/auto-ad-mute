
$.fn.exists = function () {
    return this.length !== 0;
}

var videoMuted = false;
var addonEnabled = true;

chrome.runtime.onMessage.addListener(
    function(req, sender, sendResponse) {
        if (req.action == 'enable') {
            console.log('enable');
            addonEnabled = true; 
            return;
        }
        if (req.action == 'disable') {
            console.log('disable');
            addonEnabled = false; 
            return;
        }
    }
);

$('.html5-main-video').on('play', function() {
    if (addonEnabled) {
        if ($('.videoAdUi').exists()) {
            $(".ytp-mute-button").click();
            videoMuted = true;
            chrome.runtime.sendMessage({action: 'mute_icon'});
        }
    }
});

$('.html5-main-video').on('ended', function(){
    if (addonEnabled) {
        if (videoMuted) {
            $(".ytp-mute-button[title='Unmute']").click();
            videoMuted = false;
            chrome.runtime.sendMessage({action: 'unmute_icon'});
        }
    }
});

