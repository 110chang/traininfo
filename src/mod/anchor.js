
/*
 *    Anchor
 */

var $ = jQuery = require('jquery');
var extend = require('extend');

var _instance = null;
var defaults = {
  duration: 1000,
  easing: 'easeInOutExpo',
  fix: 0
};

function Anchor() {
  if (_instance instanceof Anchor) {
    return _instance;
  }
  if (!(this instanceof Anchor)) {
    return new Anchor();
  }
  _instance = this;
}
extend(Anchor.prototype, {
  initialize: function(options) {
    this.conf = $.extend({}, defaults, options || {});
    this.$a = $('a[href*=#]');
    this.$a.off('click.navAnchor')
      .on('click.navAnchor', $.proxy(this._onClick, this));
  },
  _onClick: function(e) {
    if (e.currentTarget.hash.match(/^#\W/)) {
      return;//exclude non anchor, routing /#!/ /#/ and so.
    }
    var el = e.currentTarget;
    var $target = this._getTarget(el.hash);
    var pathIsSame = this._pathIsSame(el.pathname);
    var hostIsSame = this._hostIsSame(el.hostname);
    if ($target && pathIsSame && hostIsSame) {
      this._doAnimation($target);
      return false;
    }
  },
  _doAnimation: function($el) {
    var targetOffset = $el.offset().top - this.conf.fix;
    var scrollHeight = Screen().scrollHeight();
    var clientHeight = Screen().clientHeight();
    //console.log((targetOffset + clientHeight) +','+ scrollHeight);
    if (targetOffset < 0) {
      targetOffset = 0;
    }
    if ((targetOffset + clientHeight) > scrollHeight) {
      targetOffset = scrollHeight - clientHeight;
    }
    $('body, html').animate({
      scrollTop: targetOffset
    }, this.conf.duration, this.conf.easing).promise().done(
      $.proxy(this._onAnimationComplete, this, {$el: $el})
    );
  },
  _onAnimationComplete: function(data) {
    $(window).trigger(Anchor.ANIMATION_FINISH, {$el: data.$el});
  },
  _getTarget: function(hash) {
    var $target = $(hash);
    return $target.length > 0 && $target || $('[name=' + hash.slice(1) +']');
  },
  _pathIsSame: function(path) {
    path = /^\/.+/.test(path) ? path : '/' + path;// supple start `/` on fxxk IE9
    return location.pathname.slice(1) === path.slice(1);
  },
  _hostIsSame: function(host) {
    return location.hostname === host;
  }
});
Anchor.ANIMATION_FINISH = 'anchorAnimationFinish';

module.exports = Anchor;
