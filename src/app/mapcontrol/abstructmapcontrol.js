
/*
 * AbstructMapControl
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var $ = require('jQuery');

var Rectangle = require('../../geom/rectangle');
var GeoCoords = require('../../app/geocoords');
var Handle = require('./handle');
var Minimap = require('./minimap');
var Translater = require('./translater');

var _instance = null;

var HANDLE_INIT_LEFT = 30;
var HANDLE_WIDTH = 24;
var SLIDER_WIDTH = 240;

var trunc = Math.trunc;

function AbstructMapControl() {
  if (_instance instanceof AbstructMapControl) {
    return _instance;
  }
  if (!(this instanceof AbstructMapControl)) {
    return new AbstructMapControl();
  }
  // Target element
  this.$el = $('#routemap');

  // Handle instance
  this.handle = new Handle();
  this.handle.on('handleMove', this.onHandleMove.bind(this));

  // Minimap instance
  this.minimap = new Minimap();

  // Memory interaction coords
  this.translater = new Translater();

  // Bounds of window
  this.appWidth = window.innerWidth;
  this.appHeight = window.innerHeight;

  // Bounds of SVG content
  this.svgWidth = window.innerWidth;
  this.svgHeight = window.innerHeight;

  // Bounds of SVG ViewBox
  this.viewBox = new Rectangle(0, 0, window.innerWidth, window.innerHeight);
  this.memViewBox = null;

  // limit translation
  this.xMin = 0;
  this.yMin = 0;
  this.xMax = 0;
  this.yMax = 0;

  // ko variables

  // for testing
  this.avaterX = ko.observable(this.viewBox.x);
  this.avaterY = ko.observable(this.viewBox.y);
  this.avaterXMax = ko.observable(this.xMax);
  this.avaterYMax = ko.observable(this.yMax);
  this.avaterViewBox = ko.observable(this.getViewBox());

  this.scale = ko.observable(1);
  this.handleLeft = ko.computed(function() {
    return this.scaleToHandleLeft() + 'px';
  }, this);
  this.viewBoxStyle = ko.computed(function() {
    var vb = this.viewBox;
    return ['left: ', this.avaterX(), 'px; top: ', this.avaterY(), 'px; width: ', vb.width, 'px; height: ', vb.height, 'px'].join('');
  }, this);
  this.initViewBoxStyle = ko.computed(function() {
    var vb = this.viewBox;
    return ['left: ', 0, 'px; top: ', 0, 'px; width: ', this.appHeight, 'px; height: ', this.appHeight, 'px'].join('');
  }, this);
  this.nowScaleChange = ko.observable(false);

  _instance = this;
}
inherit(AbstructMapControl, events.EventEmitter);
extend(AbstructMapControl.prototype, {
  initialize: function() {
    console.log('AbstructMapControl#initialize');
    var bounds = GeoCoords().bounds;
    console.log(bounds.x, bounds.y, bounds.width, bounds.height);
    this.svgWidth = bounds.width;
    this.svgHeight = bounds.height;
    this.svgX = -bounds.x;
    this.svgY = -bounds.y;
    //this.update(0, 0, this.svgWidth, this.svgHeight);
    this.update(0, 0, this.viewBox.width, this.viewBox.height);

    this.minimap.initialize(this.svgWidth, this.svgHeight);

    ko.applyBindings(this, document.getElementById('mapcontrol'));
  },
  update: function(x, y, w, h) {
    console.log('AbstructMapControl#update');

    this.xMin = 0;
    this.yMin = 0;
    this.xMax = this.svgWidth - w;
    this.yMax = this.svgHeight - h;

    if (x < this.xMin) {
      x = this.xMin;
    } else if (this.xMax < x) {
      x = this.xMax;
    }
    if (y < this.yMin) {
      y = this.yMin;
    } else if (this.yMax < y) {
      y = this.yMax;
    }
    //console.log(this.viewBox.x, this.viewBox.y);
    //console.log(x, y);
    //console.log(x, y, w, h);
    this.viewBox = new Rectangle(x, y, w, h);
    console.log(this.viewBox);
    this.minimap.update(x - this.svgX, y - this.svgY, w, h);

    // for testing
    this.avaterX(this.viewBox.x);
    this.avaterY(this.viewBox.y);
    this.avaterXMax(this.xMax);
    this.avaterYMax(this.yMax);
    this.avaterViewBox(this.getViewBox());

    this.emit('boundsChanged');
  },
  expand: function(scale) {
    console.log('AbstructMapControl#expand');
    console.log(this.scale());
    console.log(scale);
    if (scale < 1) {
      scale = 1;
    } else if (10 < scale) {
      scale = 10;
    }
    var prevX = this.viewBox.x;
    var prevY = this.viewBox.y;
    var prevScale = this.scale();
    var newWidth = this.appWidth / scale;
    var newHeight = this.appHeight / scale;
    var dx = (this.viewBox.width - newWidth) / 2;
    var dy = (this.viewBox.height - newHeight) / 2;

    //if (scale === 2 && prevScale === 1) {
    //  dx -= this.svgX / scale;
    //  dy -= this.svgX / scale;
    //}
    console.log(dx, dy);
    console.log(prevX, prevY);
    this.update(prevX + dx, prevY + dy, newWidth, newHeight);
    this.scale(scale);
    this.delayScaleChange();
  },
  beforeTranslate: function(x, y) {
    var vb = this.viewBox;
    this.memViewBox = new Rectangle(vb.x, vb.y, vb.width, vb.height);
    this.translater.start(x, y);
  },
  translate: function(x, y) {
    this.translater.update(x, y);

    var V = this.translater.d().scalarMultiply(1 / this.scale());
    var destX = this.memViewBox.x - V.x;
    var destY = this.memViewBox.y - V.y;

    this.update(destX, destY, this.viewBox.width, this.viewBox.height);
  },
  getSVGAttr: function() {
    return [this.svgWidth, this.svgHeight, this.getViewBox()];
  },
  getViewBox: function() {
    var vb = this.viewBox;
    return [vb.x, vb.y, vb.width, vb.height].join(' ');
  },
  getScale: function() {
    return this.scale();
  },
  getViewBoxStyle: function() {
    var vb = this.viewBox;
    return ['{ left: ', vb.x, 'px; top: ', vb.y, 'px; width: ', vb.width, 'px; height: ', vb.height, ' }'].join('');
  },
  handleLeftToScale: function(left) {
    return (HANDLE_INIT_LEFT + SLIDER_WIDTH - left) / HANDLE_WIDTH;
  },
  scaleToHandleLeft: function() {
    return HANDLE_INIT_LEFT + SLIDER_WIDTH - this.scale() * HANDLE_WIDTH;
  },
  onHandleMove: function(data) {
    //console.log('AbstructMapControl#onHandleMove');
    this.scale(trunc(this.handleLeftToScale(data.x), 2));
    this.expand(this.scale());
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
  }()),
  isSVGElement: function(el) {
    return el.toString() === '[object SVGSVGElement]';
  }
});

module.exports = AbstructMapControl;

