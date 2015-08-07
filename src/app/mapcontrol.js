
/*
 * MapControl
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var $ = require('jQuery');

var Vector = require('../geom/vector');

var _instance = null;

var DRAG_START_TRIGGER = 'mousedown';
var DRAG_MOVE_TRIGGER = 'mousemove';
var DRAG_END_TRIGGER = 'mouseup';

if ('ontouchstart' in document.documentElement) {
  DRAG_START_TRIGGER = 'touchstart';
  DRAG_MOVE_TRIGGER = 'touchmove';
  DRAG_END_TRIGGER = 'touchend';
}

var abs = Math.abs;
var floor = Math.floor;
var pow = Math.pow;
var isToushDevice = 'ontouchstart' in document.documentElement;

function precision(n, p) {/* number, precision */
  var pp = pow(10, p);
  return floor(n * pp) / pp;
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
  this.$el = $('#routemap');
  this.appWidth = window.innerWidth;
  this.appHeight = window.innerHeight;
  this.x = 0;
  this.y = 0;
  this.xMem = 0;
  this.yMem = 0;
  this.xMin = 0;
  this.yMin = 0;
  this.xMax = 0;
  this.yMax = 0;
  this.viewWidth = this.appWidth;
  this.viewHeight = this.appHeight;
  this.scale = ko.observable(1);

  this.M = null;

  if (isToushDevice) {
    this.$el.on('touchstart', this.onTouchStart.bind(this));
    this.$el.on('touchend', this.onTouchEnd.bind(this));
  } else {
    this.$el.on('mousedown', this.onMouseDown.bind(this));
    this.$el.on('mouseup', this.onMouseUp.bind(this));
    this.$el.on('wheel._MapControl', this.onMouseWheel.bind(this));
  }
  //this.$el.on('click', this.onClick.bind(this));

  ko.applyBindings(this, document.getElementById('mapcontrol'));

  _instance = this;
}
inherit(MapControl, events.EventEmitter);
extend(MapControl.prototype, {
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
  getBounds: function() {
    return [this.appWidth, this.appHeight, this.getViewBox()];
  },
  setBounds: function(x, y, w, h) {
    this.viewWidth = w;
    this.viewHeight = h;
    this.xMax = this.appWidth - this.viewWidth;
    this.yMax = this.appHeight - this.viewHeight;
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
  getViewBox: function() {
    return [this.x, this.y, this.viewWidth, this.viewHeight].join(' ');
  },
  getPinchDestination: function(touches) {
    var V = new Vector(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);
    return V.magnitude;
  },
  onMouseDown: function(e) {
    console.log('MapControl#onMouseDown');
    this.xMem = this.x;
    this.yMem = this.y;
    this.M = new Vector(e.clientX, e.clientY);
    this.$el.on('mousemove._MapControl', this.onMouseMove.bind(this));
  },
  onMouseUp: function(e) {
    console.log('MapControl#onMouseUp');
    var D = (new Vector(e.clientX, e.clientY)).sub(this.M);
    D = D.scalarMultiply(1 / this.scale());
    if (isSVGElement(e.target) && D.magnitude < 2) {
      this.expand(precision(this.scale() + 1, 2));
    }
    this.$el.off('mousemove._MapControl');
  },
  onMouseMove: function(e) {
    console.log('MapControl#onMouseMove');
    var D = (new Vector(e.clientX, e.clientY)).sub(this.M);
    D = D.scalarMultiply(1 / this.scale());
    var destX = this.xMem - D.x;
    var destY = this.yMem - D.y;
    this.setBounds(destX, destY, this.viewWidth, this.viewHeight);
  },
  onMouseWheel: function(e) {
    //console.log('%s,%s', e.originalEvent.deltaX, e.originalEvent.deltaY);
    e.preventDefault();
    var dx = e.originalEvent.deltaX;
    var dy = e.originalEvent.deltaY;
    var ix = dx * dx > 0 ? dx / abs(dx) : 0;
    var iy = dy * dy > 0 ? dy / abs(dy) : 0;
    console.log('%s,%s', ix, iy);
    this.expand(precision(this.scale() - iy * 0.1, 2));

    return false;
  },
  onTouchStart: function(e) {
    console.log('MapControl#onTouchStart');
    var touches = e.originalEvent.touches;
    if (touches.length === 1) {
      this.xMem = this.x;
      this.yMem = this.y;
      this.M = new Vector(touches[0].clientX, touches[0].clientY);
      this.$el.on('touchmove._MapControl', this.onTouchMove.bind(this));
    } else if (touches.length === 2) {
      this.scaleMem = this.scale();
      this.M = this.getPinchDestination(touches);
      this.$el.on('touchmove._MapControl', this.onPinchMove.bind(this));
    }
  },
  onTouchEnd: function(e) {
    console.log('MapControl#onTouchEnd');
    var touches = e.originalEvent.changedTouches;
    console.log(this.M);
    if (touches.length === 1) {
      D = (new Vector(touches[0].clientX, touches[0].clientY)).sub(this.M);
      D = D.scalarMultiply(1 / this.scale());
      if (isSVGElement(e.target) && D.magnitude < 2) {
        this.expand(precision(this.scale() + 1, 2));
      }
      this.$el.off('touchmove._MapControl');
    } else if (touches.length === 2) {
      D = this.getPinchDestination(touches) - this.M;
      this.expand(precision(this.scaleMem + D * 0.01, 2));
      this.$el.off('touchmove._MapControl');
    }
  },
  onTouchMove: function(e) {
    console.log('MapControl#onTouchMove');
    var touches = e.originalEvent.touches;
    console.log(this.M);
    var D = (new Vector(touches[0].clientX, touches[0].clientY)).sub(this.M);
    D = D.scalarMultiply(1 / this.scale());
    var destX = this.xMem - D.x;
    var destY = this.yMem - D.y;
    this.setBounds(destX, destY, this.viewWidth, this.viewHeight);
  },
  onPinchMove: function(e) {
    console.log('MapControl#onPinchMove');
    var touches = e.originalEvent.touches;
    var D = this.getPinchDestination(touches) - this.M;
    this.expand(precision(this.scaleMem + D * 0.01, 2));
  }
});

module.exports = MapControl;
