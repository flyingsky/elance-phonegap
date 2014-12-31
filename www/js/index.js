var app = {
  config: [{
    icon: 'EMDR.png',
    asset: 'EMDRVideo.mp4'
  }, {
    icon: 'NLP.png',
    asset: 'NLP.mp3'
  }],

  // Application Constructor
  initialize: function() {
    var me = this;
    me.bindEvents();

    $('.icon').each(function(index, ele) {
      $(ele).css('background-image', 'url(img/' + me.config[index].icon + ')');
    });

    $('.media').each(function(index, ele) {
      var data = me.config[index];
      $(ele)
        .attr('data-screen-name', data.screenName || data.icon.replace('.png', ''))
        .attr('src', 'media/' + data.asset);

      if (!me.isVideo(data.asset)) {
        $(ele).parent().css('background', '50% 50% no-repeat url(img/' + data.icon + ')');
      }
    });
  },

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

    $('#btnInfo, #btnHelp').click(function() {
      if (me.$media) {
        me.showModal(me.$media.attr('data-screen-name'), $(this).attr('data-modal-type'));
      }
    });
  },

  showModal: function(screenName, modalType) {
    var me = this;
    if (!me.isAndroid()) {
      me.stopMedia(true);
    }

    var targetData = null;
    $.each(appData.infoHelp, function(index, obj) {
      if (obj.ScreenName === screenName) {
        targetData = obj;
        return false;
      }
    });

    $('#modalTitle').text(modalType === 'Info' ? 'Information' : 'Help');
    $('.modal-body').html(targetData[modalType]);
    $('#myModal').modal('show');
  },

  isVideo: function($media) {
    var src = typeof($media) === 'string' ? $media : $media.attr('src');
    return src.indexOf('.mp4') > 0 || src.indexOf('.m4v') > 0;
  },

  playMedia: function($media) {
    var me = this;
    me.$media = $media;
    if (me.isAndroid()) {
      var newUrl = "file:///android_asset/www/" + $media.attr('src');
      VideoPlayer.play(newUrl);
    } else {
      $media.parent().toggleClass('hidden');
      $media[0].play();
    }
  },

  stopMedia: function(isPausedOnly) {
    var me = this;
    // this code is only for iOS
    if (me.$media) {
      me.$media[0].pause();
      if (!isPausedOnly) {
        me.$media.parent().toggleClass('hidden');
        me.$media[0].currentTime = 0;
      }
    }
  },

  switchPage: function(fromPageId, toPageId) {
    if (!this.isAndroid()) {
      $('#' + fromPageId).toggleClass('hidden');
      $('#' + toPageId).toggleClass('hidden');
    }
  },

  isAndroid: function () {
    return false;
    return (device && (device.platform === 'Android' || device.platform === 'amazon-fireos'));
  },

  onDeviceReady: function() {
    console.log('device ready');
  }
};
