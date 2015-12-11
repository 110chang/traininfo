
/*
 *  Skin
 */

var extend = require('extend');

var Screen = require('../mod/screen');

var defaults = {
  base: {
    line: {
      mainStrokeWidth: 1,
      mainStrokeHasInfo: 2,
      mainStrokeSelected: 6,
      subStrokeWidth: 4,
      subStrokeSelected: 8,
    },
    station: {
      strokeWidth: 4,
      fontSize: 8
    }
  },
  pc: {
    line: {
      mainStrokeWidth: 1,
      mainStrokeHasInfo: 4,
      mainStrokeSelected: 10,
      subStrokeWidth: 6,
      subStrokeSelected: 12,
    },
    station: {
      strokeWidth: 6,
      fontSize: 10
    }
  }
};

var _instance = null;

function Skin() {
  if (_instance instanceof Skin) {
    return _instance;
  }
  if (!(this instanceof Skin)) {
    return new Skin();
  }
  this.update();
}
extend(Skin.prototype, {
  update: function() {
    if (Screen.clientWidth() > 767) {
      extend(this, defaults.pc);
    } else {
      extend(this, defaults.base);
    }
  },
  resize: function() {
    this.update();
  }
});

module.exports = Skin;