$(document).ready(function(){

    function sendToAllTabs(message, callback) {
        chrome.tabs.query({}, function(tabs) {
            for (var i=0; i<tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, message, callback);
            }
        });
    }


    var enabled = true;
    $('.button-toggle').text('Disable');
    $('.button-toggle').on('click', function(){
        if (enabled) {
            enabled = false;
            chrome.browserAction.setIcon({
                path: 'icon_disabled.png',
            });
            sendToAllTabs({action: 'disable'});
            $('.button-toggle').text('Enable');
        } else {
            enabled = true;
            chrome.browserAction.setIcon({
                path: 'icon.png',
            }); 
            sendToAllTabs({action: 'enable'});
            $('.button-toggle').text('Disable');
        }
    });
});