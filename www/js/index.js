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
    return $media.attr('src').indexOf('.mp4') > 0;
  },

  playMedia: function($media) {
    var me = this;
    me.$media = $media;
    $media.parent().toggleClass('hidden');
    if (me.isAndroid() && me.isVideo($media)) {
      window.plugins.html5Video.play($media.attr('id'));
    } else {
      $media[0].play();
    }
  },

  stopMedia: function() {
    var me = this;
    if (me.$media) {
      me.$media[0].pause();
      me.$media.parent().toggleClass('hidden');
      me.$media[0].currentTime = 0;
    }
  },

  switchPage: function(fromPageId, toPageId) {
    $('#' + fromPageId).toggleClass('hidden');
    $('#' + toPageId).toggleClass('hidden');
  },

  isAndroid: function () {
    return (device.platform == 'Android' || device.platform == 'amazon-fireos');
  },

  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    var me = this;
    if (me.isAndroid()) {
      window.plugins.html5Video.initialize({
        "media1":"thethinwomanbrain.mp4"
      });
    }
  }
};
