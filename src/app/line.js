
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

var skin = {
  normal: {
    thickness: 2,
    color: '#CCC'
  },
  hover: {
    thickness: 4
  },
  info: {
    thickness: 2,
    glow: '#9C3'
  },
  delay: {
    thickness: 2,
    glow: '#FC3'
  },
  suspend: {
    thickness: 2,
    glow: '#F66'
  },
  restart: {
    thickness: 2,
    glow: '#09C'
  }
};

function LineVM(o) {
  events.EventEmitter.call(this);

  this.status = ko.observable('normal');
  this.lineColor = o.color;
  this.color = ko.observable(skin.normal.color);
  this.glow = ko.observable();
  this.goo_key = o.goo_key;
  this.id = ko.observable(o.id);
  this.loop = o.loop === 'true' ? true : false;
  this.name = ko.observable(o.name);
  this.stations = o.stations;
  this.subway = o.color;
  this.path = ko.observable(this.getPath());
  this.strokeWidth = ko.observable(skin.normal.thickness);
}
inherit(LineVM, events.EventEmitter);
extend(LineVM.prototype, {
  update: function(status) {
    console.log(status);
    this.status(status);
    this.strokeWidth(skin[status].thickness || 1);
    this.color(skin[status].color || this.lineColor);
    this.glow(skin[status].glow || null);
  },
  getPath: function() {
    var path = this.stations.map(function(station, i) {
      var cmd = i > 0 ? 'L' : 'M';
      return cmd + station.x + ',' + station.y;
    });
    
    if (this.loop) {
      path.push('Z');
    }
    return path.join(' ');
  },
  mouseOverPath: function(e) {
    console.log(skin[this.status()].thickness);
    this.strokeWidth(skin.hover.thickness);
    this.color(this.lineColor);
    this.emit('mouseOver', this);
  },
  mouseOutPath: function(e) {
    //console.log(e);
    this.strokeWidth(skin[this.status()].thickness || 1);
    this.color(skin[this.status()].color || this.lineColor);
  }
});

module.exports = LineVM;
