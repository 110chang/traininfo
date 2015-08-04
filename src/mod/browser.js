
/*
 *    Browser
 */

var extend = require('extend');
var _instance = null;

function _is_IE(ua) {
  return /MSIE/.test(ua);
}
function _is_IE11(ua) {
  return /Trident/.test(ua);
}
function _is_iPhone(ua) {
  return /iPhone/.test(ua);
}
function _is_iPad(ua) {
  return /iPad/.test(ua);
}
function _is_iPod(ua) {
  return /iPod/.test(ua);
}
function _is_Android(ua) {
  return /Android/.test(ua);
}
function _is_mobile(ua) {
  return /Mobile/.test(ua); // Android only
}
function _is_WebKit(ua) {
  return /WebKit/.test(ua);
}
function _is_windows(platform) {
  return /Win/.test(platform);
}
function _is_mac(platform) {
  return /Mac/.test(platform);
}

function Browser(_userAgent, _platform) {
  //console.log('Browser#constructor');
  if (_instance instanceof Browser) {
    return _instance;
  }
  if (!(this instanceof Browser)) {
    return new Browser(_userAgent, _platform);
  }
  /* arguments are for testing */
  this.userAgent = _userAgent || navigator.userAgent;
  this.platform = _platform || navigator.platform;
  this.ua = this.userAgent;

  _instance = this;
}
extend(Browser.prototype, {
  IE: function() {
    return _is_IE(this.ua);
  },
  IE11: function() {
    return _is_IE11(this.ua);
  },
  iOS: function() {
    return this.iPhone() || this.iPad() || this.iPod();
  },
  iPhone: function() {
    return _is_iPhone(this.ua);
  },
  iPad: function() {
    return _is_iPad(this.ua);
  },
  iPod: function() {
    return _is_iPod(this.ua);
  },
  Android: function() {
    return _is_Android(this.ua);
  },
  WebKit: function() {
    return _is_WebKit(this.ua);
  },
  mobile: function() {
    // Android only
    return _is_mobile(this.ua) && _is_Android(this.ua);
  },
  smallScreen: function() {
    return this.iPhone() || this.mobile();
  },
  nonPC: function() {
    return this.iPhone() || this.iPad() || this.iPod() || this.Android();
  },
  tablet: function() {
    return this.iPad() || (!_is_mobile(this.ua) && _is_Android(this.ua));
  },
  Windows: function() {
    return _is_windows(this.platform);
  },
  Mac: function() {
    return _is_mac(this.platform);
  }
});

module.exports = Browser;

