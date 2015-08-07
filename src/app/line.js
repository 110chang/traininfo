
/*
 * line
 */

/*
color: "#F15A22"
goo_key: "中央線(快速)"
id: 0
loop: "false"
name: "JR中央線（快速）"
stations: Array[32]
subway: "false"
*/

var $ = require('jquery');

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');

var MapControl = require('./mapcontrol');
var Status = require('./status');
Status = Status();

function LineVM(o) {
  events.EventEmitter.call(this);

  this.map = MapControl();

  this.status = ko.observable(Status.decode(0));
  this.color = o.color;
  this.goo_key = o.goo_key;
  this.id = ko.observable(o.id);
  this.loop = o.loop === 'true' ? true : false;
  this.name = ko.observable(o.name);
  this.stations = o.stations;
  this.subway = o.subway;
  this.path = ko.observable(this.getPath());
  this.selected = ko.observable(false);

  // skins
  this.mainColor = ko.computed(this.getMainStrokeColor, this);
  this.mainStrokeWidth = ko.computed(this.getMainStrokeWidth, this);
  this.subColor = ko.computed(this.getSubStrokeColor, this);
  this.subStrokeWidth = ko.computed(this.getSubStrokeWidth, this);
}
inherit(LineVM, events.EventEmitter);
extend(LineVM.prototype, {
  isSelected: function() {
    return this.selected();
  },
  hasStatus: function() {
    return this.status().key !== 'normal';
  },
  getMainStrokeColor: function() {
    if (this.isSelected() || this.hasStatus()) {
      return this.color;
    }
    return '#CCC';
  },
  getMainStrokeWidth: function() {
    if (this.isSelected()) {
      return 6 / this.map.getScale();
    }
    if (this.hasStatus()) {
      return 4 / this.map.getScale();
    }
    return 2 / this.map.getScale();
  },
  getSubStrokeColor: function() {
    return this.status().color;
  },
  getSubStrokeWidth: function() {
    return this.getMainStrokeWidth() + 4 / this.map.getScale();
  },
  getPath: function() {
    var path = this.stations.map(function(station, i) {
      var cmd = i > 0 ? 'L' : 'M';
      return cmd + station.x + ',' + station.y;
    });
    
    if (this.loop) {
      path.push('Z');
    }
    if (!path || path.length === 0) {
      path = ['M0,0'];
    }
    return path.join(' ');
  },
  update: function(status) {
    status = status || this.status();
    this.status(status);
  },
  mouseOverPath: function(e) {
    //console.log('LineVM#mouseOverPath');
    this.selected(true);
    this.emit('mouseOver', this);
  },
  mouseOutPath: function(e) {
    //console.log('LineVM#mouseOutPath');
    this.selected(false);
    //this.strokeWidth((skin[this.status()].thickness || 1) / this.map.scale());
    //this.color(skin[this.status()].color || this.lineColor);
  }
});

module.exports = LineVM;
