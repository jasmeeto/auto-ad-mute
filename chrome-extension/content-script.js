$.fn.exists = function () {
    return this.length !== 0;
}

$('.html5-main-video').on('play', function() {
    if ($('.videoAdUi').exists()) {
        $(".ytp-mute-button[title='Mute']").click();
    } else {
        $(".ytp-mute-button[title='Unmute']").click();
    }
});

$('.html5-main-video').on('ended', function(){
    $(".ytp-mute-button[title='Unmute']").click();
});