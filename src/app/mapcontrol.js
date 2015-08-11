
/*
 * MapControl
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var $ = require('jQuery');

var Vector = require('../geom/vector');
var Handle = require('./mapcontrol/handle');
var GeoCoords = require('../app/geocoords');

var _instance = null;

var HANDLE_INIT_LEFT = 30;
var HANDLE_WIDTH = 24;
var SLIDER_WIDTH = 240;

var abs = Math.abs;
var floor = Math.floor;
var sqrt = Math.sqrt;
var pow = Math.pow;

function trunc(n, p) {/* number, trunc */
  var pp = pow(10, p);
  return floor(n * pp) / pp;
}
function isToushDevice() {
  return 'ontouchstart' in document.documentElement;
}
function isSVGElement(el) {
  return el.toString() === '[object SVGSVGElement]';
}

function MapControl() {
  if (_instance instanceof MapControl) {
    return _instance;
  }
  if (!(this instanceof MapControl)) {
    return new MapControl();
  }
  this.handle = new Handle();
  this.handle.on('handleMove', this.onHandleMove.bind(this));

  this.$el = $('#routemap');
  // Bounds of window
  this.appWidth = window.innerWidth;
  this.appHeight = window.innerHeight;
  // Bounds of SVG content
  this.svgWidth = window.innerWidth;
  this.svgHeight = window.innerHeight;
  // Bounds of SVG ViewBox
  this.viewWidth = window.innerWidth;
  this.viewHeight = window.innerHeight;
  this.x = 0;
  this.y = 0;
  this.xMax = 0;
  this.yMax = 0;
  this.mem = {};

  // ko variables
  this.scale = ko.observable(1);
  this.handleLeft = ko.computed(function() {
    return this.scaleToHandleLeft() + 'px';
  }, this);
  this.nowScaleChange = ko.observable(false);
  ko.applyBindings(this, document.getElementById('mapcontrol'));

  // Bind events
  if (isToushDevice()) {
    this.$el.on('touchstart._MapControl', this.onTouchStart.bind(this));
    this.$el.on('touchend._MapControl', this.onTouchEnd.bind(this));
  } else {
    this.$el.on('mousedown._MapControl', this.onMouseDown.bind(this));
    this.$el.on('mouseup._MapControl', this.onMouseUp.bind(this));
    this.$el.on('wheel._MapControl', this.onMouseWheel.bind(this));
  }

  _instance = this;
}
inherit(MapControl, events.EventEmitter);
extend(MapControl.prototype, {
  initialize: function() {
    console.log(GeoCoords().bounds);
    var bounds = GeoCoords().bounds;
    this.svgWidth = bounds.width;
    this.svgHeight = bounds.height;
    this.setBounds(-bounds.x, -bounds.y, this.viewWidth, this.viewHeight);
  },
  memory: function(a, b, c, d) {
    if (a != null && b != null && c != null && d != null) {
      this.mem.V = new Vector(a, b);// View box point
      this.mem.P = new Vector(c, d);// Click start point
    } else {
      this.mem.d = a;
      this.mem.scale = b;
    }
  },
  expand: function(scale) {
    if (scale < 1) {
      scale = 1;
    }
    if (scale > 10) {
      scale = 10;
    }
    var newWidth = this.appWidth / scale;
    var newHeight = this.appHeight / scale;
    var transX = (this.viewWidth - newWidth) / 2;
    var transY = (this.viewHeight - newHeight) / 2;
    this.setBounds(this.x + transX, this.y + transY, newWidth, newHeight);
    this.scale(scale);
  },
  translate: function(x, y) {
    var V = this.getTranslateVector(x, y);
    var destX = this.mem.V.x - V.x;
    var destY = this.mem.V.y - V.y;
    this.setBounds(destX, destY, this.viewWidth, this.viewHeight);
  },
  getBounds: function() {
    return [this.svgWidth, this.svgHeight, this.getViewBox()];
  },
  setBounds: function(x, y, w, h) {
    this.viewWidth = w;
    this.viewHeight = h;
    this.xMax = this.svgWidth - this.viewWidth;
    this.yMax = this.svgHeight - this.viewHeight;
    if (x < 0) {
      x = 0;
    } else if (this.xMax < x) {
      x = this.xMax;
    }
    if (y < 0) {
      y = 0;
    } else if (this.yMax < y) {
      y = this.yMax;
    }
    this.x = x;
    this.y = y;
    this.emit('boundsChanged');
  },
  getScale: function() {
    return this.scale();
  },
  getScaleText: function() {
    return 'x' + this.scale();
  },
  handleLeftToScale: function(left) {
    return (HANDLE_INIT_LEFT + SLIDER_WIDTH - left) / HANDLE_WIDTH;
  },
  scaleToHandleLeft: function() {
    return HANDLE_INIT_LEFT + SLIDER_WIDTH - this.scale() * HANDLE_WIDTH;
  },
  getViewBox: function() {
    return [this.x, this.y, this.viewWidth, this.viewHeight].join(' ');
  },
  getTranslateVector: function(x, y) {
    return (new Vector(x, y)).sub(this.mem.P).scalarMultiply(1 / this.scale());
  },
  getPinchDestination: function(touches) {
    var x = touches[1].clientX - touches[0].clientX;
    var y = touches[1].clientY - touches[0].clientY;
    return sqrt(x * x + y * y);
  },
  onMouseDown: function(e) {
    //console.log('MapControl#onMouseDown');
    this.memory(this.x, this.y, e.clientX, e.clientY);
    this.$el.on('mousemove._MapControl', this.onMouseMove.bind(this));
  },
  onMouseUp: function(e) {
    //console.log('MapControl#onMouseUp');
    var V = this.getTranslateVector(e.clientX, e.clientY);

    // マウスダウン位置とマウスアップ位置が近い場合はクリック扱い
    if (isSVGElement(e.target) && V.magnitude < 2) {
      this.expand(trunc(this.scale() + 1, 2));
      this.setBounds(this.mem.V.x, this.mem.V.y, this.viewWidth, this.viewHeight);
      this.delayScaleChange();
    } else {
      this.translate(e.clientX, e.clientY);
    }
    this.$el.off('mousemove._MapControl');
  },
  onMouseMove: function(e) {
    //console.log('MapControl#onMouseMove');
    this.translate(e.clientX, e.clientY);
  },
  onMouseWheel: function(e) {
    //console.log('MapControl#onMouseWheel');
    e.preventDefault();
    var dy = e.originalEvent.deltaY;
    var iy = dy * dy > 0 ? dy / abs(dy) : 0;
    this.expand(trunc(this.scale() - iy * 0.2, 2));
    this.delayScaleChange();

    return false;
  },
  onTouchStart: function(e) {
    //console.log('MapControl#onTouchStart');
    var touches = e.originalEvent.touches;
    if (touches.length === 1) {
      this.memory(this.x, this.y, touches[0].clientX, touches[0].clientY);
      this.$el.on('touchmove._MapControl', this.onTouchMove.bind(this));
    } else if (touches.length === 2) {
      this.memory(this.getPinchDestination(touches), this.scale());
      this.$el.on('touchmove._MapControl', this.onPinchMove.bind(this));
    }
  },
  onTouchEnd: function(e) {
    //console.log('MapControl#onTouchEnd');
    var touches = e.originalEvent.changedTouches;
    if (touches.length === 1) {
      var V = this.getTranslateVector(touches[0].clientX, touches[0].clientY);
      if (isSVGElement(e.target) && V.magnitude < 2) {
        this.expand(trunc(this.scale() + 1, 2));
        this.setBounds(this.mem.V.x, this.mem.V.y, this.viewWidth, this.viewHeight);
        this.delayScaleChange();
      } else {
        this.translate(touches[0].clientX, touches[0].clientY);
      }
      this.$el.off('touchmove._MapControl');
    } else if (touches.length === 2) {
      var d = this.getPinchDestination(touches) - this.mem.d;
      this.expand(trunc(this.mem.scale + d * 0.01, 2));
      this.$el.off('touchmove._MapControl');
    }
  },
  onTouchMove: function(e) {
    //console.log('MapControl#onTouchMove');
    var touches = e.originalEvent.touches;
    this.translate(touches[0].clientX, touches[0].clientY);
  },
  onPinchMove: function(e) {
    //console.log('MapControl#onPinchMove');
    var touches = e.originalEvent.touches;
    var d = this.getPinchDestination(touches) - this.mem.d;
    this.expand(trunc(this.mem.scale + d * 0.01, 2));
    this.delayScaleChange();
  },
  onHandleMove: function(data) {
    //console.log('MapControl#onHandleMove');
    this.scale(trunc(this.handleLeftToScale(data.x), 2));
    this.expand(this.scale());
    this.delayScaleChange();
  },
  delayScaleChange: (function() {
    var timer = null;
    return function() {
      if (timer) {
        this.nowScaleChange(true);
        clearTimeout(timer);
      }
      timer = setTimeout(function() {
        this.nowScaleChange(false);
      }.bind(this), 500);
    };
  }())
});

module.exports = MapControl;
