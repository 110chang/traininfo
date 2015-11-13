/*
 * station
 */

/*
lat: "35.681247"
line: "JR中央線"
lng: "139.766709"
name: "東京"
next: "神田"
postal: "1000005"
prefecture: "東京都"
prev: "null"
priority: 11
priorityRange: Object
x: 834.4201494769021
y: 533.6872976101727
*/


var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');

var MapControlFactory = require('./mapcontrolfactory');
var Status = require('./status');

function StationVM(o) {
  //console.log('StationVM#constructor');
  events.EventEmitter.call(this);

  this.map = MapControlFactory();
  this.lat = o.lat * 1;
  this.lng = o.lng * 1;
  this.line = [o.line];
  this.name = o.name;
  this.next = [o.next];
  this.postal = o.postal;
  this.prefecture = o.prefecture;
  this.prev = [o.prev];
  //this.priority = o.priority;
  //this.priorityRange = o.priorityRange;
  //this.threshold = this.getPriorityThreshold();
  this.x = o.x * 1;
  this.y = o.y * 1;
  this.priority = 0;
  this.threshold = 0;
}
inherit(StationVM, events.EventEmitter);
extend(StationVM.prototype, {
  averageLatLng: function(lat, lng) {
    this.lat = (this.lat + lat) / 2;
    this.lng = (this.lng + lng) / 2;
  },
  averagePos: function(x, y) {
    this.x = (this.x + x) / 2;
    this.y = (this.y + y) / 2;
  },
  addLine: function(name) {
    if (this.line.indexOf(name) === -1) {
      this.line.push(name);
    }
    this.priority = this.line.length;
  },
  addNext: function(name) {
    if (this.next.indexOf(name) === -1) {
      this.next.push(name);
    }
  },
  addPrev: function(name) {
    if (this.prev.indexOf(name) === -1) {
      this.prev.push(name);
    }
  },
  setThreshold: function(min, max) {
    this.threshold = max - this.priority - min;
  },
  getFontSize: function() {
    return 10 / this.map.getScale();
  },
  switchVisibility: function() {
    return this.map.getScale() >= this.threshold;
  }
});

module.exports = StationVM;


