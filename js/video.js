//This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



var videoPlayer = {

    currentVideo: null,
    totalDuration: 0,
    setSeekInterval: 0,
    colors: [ '#1e1e1e','#d2d2cd'],
    colIndex: 0,
    videoIndex: 0,
    isPlaying: false,
    videos: ['3aJlF-nF8lE', 'lCpwRjnjv5Q', '3aJlF-nF8lE'],

    init: function() {
        this.loadDefaultVideoImage();
        this.videoChange();
        this.bindEvents();
    },

    onPlayerReady: function(event) {
        var self = videoPlayer;
        self.currentVideo = event.target;
        self.currentVideo.setVolume(100);
    },

    onPlayerStateChange: function(state) {
        var self = videoPlayer;

        state = state.data;

        switch(state) {
            case 1:  // playing
                $('#videos #carousel_ul').css('z-index', '0');
                $('div.play-pause').fadeOut('slow');
                self.isPlaying = true;
                self.setSeekInterval = window.setInterval(function(){
                    self.changeSeekBar();
                }, 20);
                break;
            case 2:  // paused
                self.isPlaying = false;
                clearInterval(self.setSeekInterval);
                $('#videos #carousel_ul').css('z-index', '9');
                $('div.play-pause').fadeIn('slow');
                break;
            case 0:  // ended
                self.isPlaying = false;
                clearInterval(self.setSeekInterval);
                $('#current_time').text(parseInt(self.totalDuration/60) + ':' + parseInt(self.totalDuration%60));
                $("#customSeek").css('width', '100%');
                break;

            case -1: // unstarted
            case 3:  // buffering
            case 5:  // cued
                self.isPlaying = false;
                $("#customSeek").css('width','0%')
                clearInterval(self.setSeekInterval);
                break;
            default: // unknown
                //console.log("err = " + state);
                self.isPlaying = false;
        }

        $("#player").focus();
    },

    loadDefaultVideoImage: function() {
        var self = this;
        $('[data-video]').each(function() {
            var img = new Image();
            img.src = 'https://i1.ytimg.com/vi/' + self.videos[parseInt($(this).attr('data-video'))] + '/maxresdefault.jpg';
            img.width = '940';
            $(this).parent().append(img);
        });
    },

    bindEvents: function() {
        var self = this;
        $('.play-pause .play').click(function(e){
            self.currentVideo.playVideo();
        });

        // Play button
        $('.play-btn').click(function(){
            $(this).parent().fadeOut('slow');
            //$('.video-content').css('visibility', 'visible');
            self.videoIndex = parseInt($(this).attr('data-video'));
            self.videoPlay();

        });

        // Full-screen button
        $("#full-screen").click(function() {
            var elem = document.getElementById("player"); // Make the body go full screen.
            self.requestFullScreen(elem);
        });

        // Cinema Mode
        $('#cinema_mode').click(function(){
            self.cinemaMode();
            self.colIndex = (self.colIndex == self.colors.length-1) ? 0 : (self.colIndex + 1);
        });

        //Volume control
        $("#volume-control span").unbind('click').bind('click', function() {
            self.bindVolume($(this));
        });

        //Stop on Next/Prev
        $("#right_scroll, #left_scroll").bind('click', function() {

            switch ($(this).attr('id')) {
                case 'right_scroll':
                    self.videoIndex++;
                    break;
                case 'left_scroll':
                    self.videoIndex--;
                    break;
            }

            if (self.videoIndex < 0) {
                self.videoIndex = self.videos.length-1;
            }

            if (self.videoIndex >= self.videos.length) {
                self.videoIndex = 0
            }

            self.bindNextPrev();
        });

        // Hack for full screen mode in IE
        if ($.browser.msie) {
            $('body').live("keyup", function(e) {
                if (e.keyCode == 27) {
                    $("#player").removeClass("fullScreen");
                    $('html').css('overflow-y', 'scroll');
                }
            });
        }

        //Seek Bar functionality
        $('#seek_wrapper').click(function(e) {
            var obj = $(this);
            if (self.isPlaying) {
                self.seekBar(obj, e);
            } else {
                self.videoPlay();
                var timer = setInterval(function(){
                    if(self.isPlaying) {
                        clearInterval(timer);
                        self.seekBar(obj, e);
                    }
                }, 500);
            }
        });

    },

    videoPlay: function() {
        var self = this;
        self.currentVideo.loadVideoById(self.videos[self.videoIndex], 0, 'default');
        self.currentVideo.playVideo();
        setTimeout(function() {
            self.videoChange();
        }, 400);
    },

    seekBar: function(obj, e) {
        var self = this;
        var t = parseInt(e.clientX - obj.offset().left) * 100 / obj.width();
        var seekTo =  parseFloat(t * self.totalDuration / 100).toFixed(2);
        clearInterval(self.setSeekInterval);
        self.currentVideo.seekTo(seekTo);    // Seek To particular position.
    },

    bindVolume: function(obj) {
        var self = this;
        $('#volume-control span').removeClass( "active" );
        var currentVal = obj.addClass( "active" ).attr('data-value');
        obj.prevAll().addClass( "active" );
        self.currentVideo.setVolume(currentVal);
    },

    requestFullScreen: function(element) {

        var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
        if (requestMethod) { // Native full screen.
            requestMethod.call(element);
        } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
            /*var wscript = new ActiveXObject("WScript.Shell");
             if (wscript !== null) {
             wscript.SendKeys("{F11}");
             }*/

            $("#player").addClass("fullScreen");
            $('html').css('overflow-y', 'hidden');
        }
    },

    cinemaMode: function() {
        var self = this;

        $("body,#header,#footer").animate({
            backgroundColor: self.colors[self.colIndex]
        }, 2000 );

    },

    bindNextPrev: function() {
        var self = this;

        if (self.currentVideo != null) {
            self.currentVideo.stopVideo();
        }

        //$('.video-content').css('visibility', 'hidden');
        $('#videos #carousel_ul').css('z-index', '9');
        $('.play-pause').fadeOut('slow');
        $('.video-thumbnail').fadeIn('slow');

        self.videoChange();
    },

    changeSeekBar: function() {
        var self = this;
        var currentTime = self.currentVideo.getCurrentTime();
        var t = parseFloat(currentTime * 100 / self.totalDuration).toFixed(2);
        $('#current_time').text(parseInt(currentTime/60) + ':' + self.appendPadding(parseInt(currentTime%60)));
        $("#customSeek").css('width', t + '%');
    },

    appendPadding: function(t) {
        return ("0" + t).slice(-2);
    },

    videoChange: function() {
        var self = this;

        $.ajax({
            url: 'http://gdata.youtube.com/feeds/api/videos/'+self.videos[self.videoIndex]+'?v=2&alt=json',
            dataType: 'jsonp',
            success:function(data) {
                $("#title").text(data.entry.title.$t);
                self.totalDuration = parseInt(data.entry.media$group.yt$duration.seconds);

                $('#total_time').text(parseInt(self.totalDuration/60) + ':' + self.appendPadding(parseInt(self.totalDuration%60)));
                $('#current_time').text("0:00");
            }
        });

        $('#counter').text('(' + self.appendPadding(self.videoIndex+1) + '/' + self.appendPadding(self.videos.length) + ')');
    }
};

var onYouTubeIframeAPIReady = function() {
    var p = new YT.Player('player', {
        height: '529',
        width: '940',
        videoId: videoPlayer.videos[videoPlayer.videoIndex],
        playerVars: {
            controls: 0,
            showinfo: 0,
            // autohide: 0,
            hd: 0,
            wmode: "transparent"
        },

        events: {
            'onReady': videoPlayer.onPlayerReady,
            'onStateChange': videoPlayer.onPlayerStateChange
        }
    });
}

$(document).ready(function() {
    videoPlayer.init();
});