
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

function MapControl() {
  if (_instance instanceof MapControl) {
    return _instance;
  }
  if (!(this instanceof MapControl)) {
    return new MapControl();
  }
  this.$el = $('#routemap');
  this.appWidth = 600;
  this.appHeight = 400;
  this.x = 0;
  this.y = 0;
  this.xMem = 0;
  this.yMem = 0;
  this.xMax = 0;
  this.yMax = 0;
  this.viewWidth = 600;
  this.viewHeight = 400;
  this.scale = ko.observable(1);

  this.M = null;

  //this.$el.on('click', this.onClick.bind(this));
  this.$el.on('mousedown', this.onMouseDown.bind(this));
  this.$el.on('mouseup', this.onMouseUp.bind(this));

  ko.applyBindings(this, document.getElementById('mapcontrol'));

  _instance = this;
}
inherit(MapControl, events.EventEmitter);
extend(MapControl.prototype, {
  getBounds: function() {
    return [this.appWidth, this.appHeight, this.getViewBox()];
  },
  setBounds: function(x, y, w, h) {
    this.viewWidth = w;
    this.viewHeight = h;
    this.x = x;
    this.y = y;
    this.xMax = this.appWidth - this.viewWidth;
    this.yMax = this.appHeight - this.viewHeight;
    this.scale(this.appHeight / this.viewHeight);
    this.emit('boundsChanged');
  },
  getViewBox: function() {
    return [this.x, this.y, this.viewWidth, this.viewHeight].join(' ');
  },
  startDrag: function() {
    this.$el.on('mousemove', this.onMouseMove.bind(this));
  },
  stopDrag: function() {
    this.$el.off('mousemove');
  },
  onClick: function(e) {
    if (this.x === 0) {
      this.setBounds(150, 100, 300, 200);
    } else {
      this.setBounds(0, 0, 600, 400);
    }
  },
  onMouseDown: function(e) {
    //console.log('MapControl#onMouseDown');
    //console.log(e);
    this.xMem = this.x;
    this.yMem = this.y;
    this.M = new Vector(e.clientX, e.clientY);
    this.startDrag();
  },
  onMouseUp: function(e) {
    //console.log('MapControl#onMouseUp');
    //console.log(e);
    var D = (new Vector(e.clientX, e.clientY)).sub(this.M);
    if (D.magnitude < 2) {
      if (this.x === 0) {
        this.setBounds(150, 100, 300, 200);
      } else {
        this.setBounds(0, 0, 600, 400);
      }
    } else {
      console.log(D);
    }
    this.stopDrag();
  },
  onMouseMove: function(e) {
    var D = (new Vector(e.clientX, e.clientY)).sub(this.M);
    var destX = this.xMem - D.x;
    var destY = this.yMem - D.y;
    if (destX < 0 || this.xMax < destX) {
      destX = this.x;
    }
    if (destY < 0 || this.yMax < destY) {
      destY = this.y;
    }
    this.setBounds(destX, destY, this.viewWidth, this.viewHeight);
  }
});

module.exports = MapControl;
