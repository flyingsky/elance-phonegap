var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    var me = this;

    document.addEventListener('deviceready', me.onDeviceReady, false);

    $('.icon').click(function(event) {
      var $icon = $(this);
      var index = $icon.attr('id').replace('icon', '');
      var $media = $('#media' + index);
      me.switchPage('icons', 'medias');
      me.playMedia($media);
    });

    $('#btnCancel').click(function() {
      me.stopMedia();
      me.switchPage('medias', 'icons');
    });
  },

  isVideo: function($media) {
    return $media.attr('src').indexOf('.mp4') || $media.attr('src').indexOf('.m4v') > 0;
  },

  playMedia: function($media) {
    var me = this;

    if (me.isAndroid()) {
      var newUrl = "file:///android_asset/www/" + $media.attr('src');
      VideoPlayer.play(newUrl);
    } else {
      me.$media = $media;
      $media.parent().toggleClass('hidden');
      $media[0].play();
    }
  },

  stopMedia: function() {
    var me = this;
    // this code is only for iOS
    if (me.$media) {
      me.$media[0].pause();
      me.$media.parent().toggleClass('hidden');
      me.$media[0].currentTime = 0;
    }
  },

  switchPage: function(fromPageId, toPageId) {
    if (!this.isAndroid()) {
      $('#' + fromPageId).toggleClass('hidden');
      $('#' + toPageId).toggleClass('hidden');
    }
  },

  isAndroid: function () {
    return (device.platform === 'Android' || device.platform === 'amazon-fireos');
  },

  onDeviceReady: function() {
    console.log('device ready');
  }
};
