
/*
 * MapControl
 */

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');
var $ = require('jQuery');

var Rectangle = require('../../geom/rectangle');
var GeoCoords = require('../../app/geocoords');
var Slider = require('./slider');
var Minimap = require('./minimap');
var Translater = require('./translater');

var _instance = null;
var MAX_SCALE = 10;

var trunc = Math.trunc;

function MapControl() {
  if (_instance instanceof MapControl) {
    return _instance;
  }
  if (!(this instanceof MapControl)) {
    return new MapControl();
  }
  // Target element
  this.$el = $('#routemap');
  this.$el.on('touchmove', function(e) {
    e.preventDefault();
  });

  // Handle instance
  this.slider = new Slider();
  this.slider.on('change', this.onSliderChange.bind(this));

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
  this.scale = ko.observable(1);
  this.handle = ko.computed(function() {
    return this.slider.getHandlePos(this.scale());
  }, this);

  this.nowScaleChange = ko.observable(false);

  _instance = this;
}
inherit(MapControl, events.EventEmitter);
extend(MapControl.prototype, {
  initialize: function() {
    //console.log('MapControl#initialize');
    var bounds = GeoCoords().bounds;

    this.svgWidth = bounds.width;
    this.svgHeight = bounds.height;
    this.svgX = -bounds.x;
    this.svgY = -bounds.y;
    this.update(0, 0, this.viewBox.width, this.viewBox.height);
    this.minimap.initialize(this.svgWidth, this.svgHeight);
    this.center(this.svgWidth / 2, this.svgHeight / 2);

    ko.applyBindings(this, document.getElementById('mapcontrol'));
  },
  resize: function(w, h) {
    console.log('MapControl#resize');
    var bounds = GeoCoords().bounds;
    console.log(w, h);
    console.log(bounds);
    this.appWidth = w;
    this.appHeight = h;
    this.svgWidth = bounds.width;
    this.svgHeight = bounds.height;
    this.svgX = -bounds.x;
    this.svgY = -bounds.y;
    this.scale(1);
    this.update(0, 0, w, h);
    this.minimap.resize(this.svgWidth, this.svgHeight);
    this.center(this.svgWidth / 2, this.svgHeight / 2);
  },
  update: function(x, y, w, h) {
    //console.log('MapControl#update');
    //this.xMin = 0;
    //this.yMin = 0;
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
    this.viewBox = new Rectangle(x, y, w, h);
    this.minimap.update(x - this.svgX, y - this.svgY, w, h);

    this.emit('boundsChanged');
  },
  expand: function(scale, cx, cy) {
    //console.log('MapControl#expand');
    if (scale < 1) {
      scale = 1;
    } else if (MAX_SCALE < scale) {
      scale = MAX_SCALE;
    }
    var newWidth = this.appWidth / scale;
    var newHeight = this.appHeight / scale;
    var dx = (this.viewBox.width - newWidth) / 2;
    var dy = (this.viewBox.height - newHeight) / 2;
    
    if (typeof cx === 'number' && typeof cx === 'number') {
      dx = cx / this.scale() - newWidth / 2;
      dy = cy / this.scale() - newHeight / 2;
    }
    //console.log(dx, dy);
    this.update(this.viewBox.x + dx, this.viewBox.y + dy, newWidth, newHeight);
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
  center: function(x, y) {
    var prevX = this.viewBox.x;
    var prevY = this.viewBox.y;
    var dx = (x - this.appWidth / 2) / this.scale();
    var dy = (y - this.appHeight / 2) / this.scale();
    this.update(prevX + dx, prevY + dy, this.viewBox.width, this.viewBox.height);
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
  },
  onSliderChange: function(data) {
    //console.log('Slider#onHandleMove');
    this.scale(trunc(data.scale, 2));
    this.expand(this.scale());
  },
});

module.exports = MapControl;

