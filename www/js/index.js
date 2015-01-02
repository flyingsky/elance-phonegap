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

    document.addEventListener('deviceready', function() {
      me.onDeviceReady.call(me, arguments);
    }, false);

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
    return (device && (device.platform === 'Android' || device.platform === 'amazon-fireos'));
  },

  onDeviceReady: function() {
    console.log('device ready');
    this.initStore();
  },


  //========================= Auto-Renew Subscription ==============================

  initStore: function() {
    var me = this;

    if (!window.store) {
      me.log('Store not available');
      return;
    }

    // Enable maximum logging level
    store.verbosity = store.DEBUG;

    // FIXME: replace the id/alias with your real values
    var password = '2567363b81c44bdeac914c8d627d50dc';
    var productId = 'com.dalia.media.autorenew5';
    var productAlias = 'autorenew5';
    var isSandBox = true;

    // Enable remote receipt validation
    var queryString = '?password=' + password + '&isSandBox=' + isSandBox + '&isAutoRenew=true';
    store.validator = "http://checkpurchase-flyingsky.rhcloud.com/verify" + queryString;
    //store.validator = "http://10.0.0.2:3000/verify" + queryString;

    // Inform the store of your products
    me.log('registerProducts');

    store.register({
      id: productId,
      alias: productAlias,
      type:  store.PAID_SUBSCRIPTION
    });

    // When any product gets updated, refresh the HTML.
    store.when("product").updated(function (p) {
      app.renderIAP(p);
    });

    store.when(productAlias).approved(function(p) {
      me.log("verify subscription");
      p.verify().success(function(p, purchaseData) {
        // TODO: you can get all receipt information from here, see more information from
        // https://developer.apple.com/library/ios/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html#//apple_ref/doc/uid/TP40010573-CH104-SW4
        // please use purchaseData.latest_receipt_info to get purchase information
        console.log(purchaseData);
      });
    });
    store.when(productId).verified(function(p) {
      me.log("subscription verified");
      p.finish();
    });
    store.when(productId).unverified(function(p) {
      me.log("subscription unverified");
    });
    store.when(productId).cancelled(function(p) {
      me.log('subscription cancelled');
    });
    store.when(productId).expired(function(p) {
      me.log('subscription expired');
    });
    store.when(productId).updated(function(p) {
      if (p.owned) {
        document.getElementById('subscriber-info').innerHTML = 'You are a lucky subscriber!';
      }
      else {
        document.getElementById('subscriber-info').innerHTML = 'You are not subscribed';
      }
    });

    // Log all errors
    store.error(function(error) {
      me.log('ERROR ' + error.code + ': ' + error.message);
    });

    // When the store is ready (i.e. all products are loaded and in their "final"
    // state), we hide the "loading" indicator.
    //
    // Note that the "ready" function will be called immediately if the store
    // is already ready.
    store.ready(function() {
      var el = document.getElementById("loading-indicator");
      if (el) {
        el.style.display = 'none';
      }

      el = document.getElementById('refresh-button');
      if (el) {
        el.style.display = 'block';
        el.onclick = function(ev) {
          store.refresh();
        };
      }
    });

    // Alternatively, it's technically feasible to have a button that
    // is always visible, but shows an alert if the full version isn't
    // owned.
    // ... but your app may be rejected by Apple if you do it this way.
    //
    // Here is the pseudo code for illustration purpose.

    // myButton.onclick = function() {
    //   store.ready(function() {
    //     if (store.get("full version").owned) {
    //       // access the awesome feature
    //     }
    //     else {
    //       // display an alert
    //     }
    //   });
    // };


    // Refresh the store.
    //
    // This will contact the server to check all registered products
    // validity and ownership status.
    //
    // It's fine to do this only at application startup, as it could be
    // pretty expensive.
    me.log('refresh');
    store.refresh();
  },

  renderIAP: function(p) {

    var elId = p.id.split(".")[3];

    var el = document.getElementById('purchase');
    if (!el) return;

    if (!p.loaded) {
      el.innerHTML = '<h3>...</h3>';
    }
    else if (!p.valid) {
      el.innerHTML = '<h3>' + p.alias + ' Invalid</h3>';
    }
    else if (p.valid) {
      var html = "<h3> Title: " + p.title + "</h3>" + "<p>Description:" + p.description + "</p>";
      if (p.canPurchase) {
        html += "<button class='btn btn-default' id='buy-" + p.id + "' productId='" + p.id + "' type='button'>Subscribe " + p.price + "</button>";
      }
      el.innerHTML = html;
      if (p.canPurchase) {
        document.getElementById("buy-" + p.id).onclick = function (event) {
          var pid = this.getAttribute("productId");
          store.order(pid);
        };
      }
    }
  },

  // Utilities
  // ---------
  //
  // log both in the console and in the HTML #log element.
  log: function(arg) {
    try {
      if (typeof arg !== 'string')
        arg = JSON.stringify(arg);
      console.log(arg);
      document.getElementById('log').innerHTML += '<div>' + arg + '</div>';
    } catch (e) {}
  }
};
