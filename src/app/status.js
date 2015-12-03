
/*
 * status
 */

// external libraries
var extend = require('extend');

var _instance = null;

var REG_RESTART = /(:?遅れ|運休|運転変更|運転を?見合).+いましたが.+(:?平常|運転を?再開)/;
var REG_INFO = /(:?運転状況|一部列車に(:?遅れ|運休|運転変更|区間運休))/;
var REG_DELAY = /(:?遅れ|列車遅延)/;
var REG_SUSPEND = /運転(:?.+)?見合/;
var REG_NORMAL = /マッチなし/;
var REG_ALL = /(:?再開|(:?遅れ|運休|運転変更)?が出ていましたが.+平常|一部列車.運休|遅れ.運転変更|直通運転.中止|遅れ.運休|運転変更|臨時|遅れ|遅延|見合|運休|平常)/;

var STATUSES = [{
  id: 0,
  key: 'normal',
  label: '平常運転',
  color: '#390'
}, {
  id: 1,
  key: 'info',
  label: '運転情報',
  color: '#9C0'//'#9C3'
}, {
  id: 2,
  key: 'delay',
  label: '遅延',
  color: '#FC0'//'#FC3'
}, {
  id: 3,
  key: 'suspend',
  label: '運転見合',
  color: '#F66'//'#F66'
}, {
  id: 4,
  key: 'restart',
  label: '運転再開',
  color: '#09F'//'#09C'
}];

function Status() {
  if (_instance instanceof Status) {
    return _instance;
  }
  if (!(this instanceof Status)) {
    return new Status();
  }
  _instance = this;
}
extend(Status.prototype, {
  encode: function(msg) {
    msg = msg + '';

    if (REG_RESTART.test(msg)) {
      return 4;
    } else if (REG_INFO.test(msg)) {
      return 1;
    } else if (REG_SUSPEND.test(msg)) {
      return 3;
    } else if (REG_DELAY.test(msg)) {
      return 2;
    } else if (REG_NORMAL.test(msg)) {
      return 1;
    } else {
      return 0;
    }
    return 1;
  },
  decode: function(status) {
    if (typeof status !== 'number'){
      throw new Error('Arguments must be number.');
    }
    return STATUSES[status] || false;
  },
  convert: function(str) {
    return this.decode(this.encode(str));
  }
});


module.exports = Status;
