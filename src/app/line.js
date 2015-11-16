
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

var extend = require('extend');
var events = require('events');
var inherit = require('util').inherits;
var ko = require('knockout');

var MapControlFactory = require('./mapcontrolfactory');
var Status = require('./status');

function LineVM(o) {
  events.EventEmitter.call(this);

  this.map = MapControlFactory();

  this.status = ko.observable(Status().decode(0));
  this.content = ko.observable('');
  this.color = o.color;
  this.goo_key = o.goo_key;
  this.id = ko.observable(o.id);
  this.loop = !!o.loop;
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
    return '#333';
  },
  getMainStrokeWidth: function() {
    if (this.isSelected()) {
      return 10 / this.map.getScale();
    }
    if (this.hasStatus()) {
      return 4 / this.map.getScale();
    }
    return 1 / this.map.getScale();
  },
  getSubStrokeColor: function() {
    var normalColor = this.isSelected() ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.05)';
    return this.hasStatus() ? this.status().color : normalColor;
  },
  getSubStrokeWidth: function() {
    var fat = this.isSelected() ? 12 : 6;
    return this.getMainStrokeWidth() + fat / this.map.getScale();
  },
  getPath: function() {
    var path = this.stations.map(function(station, i) {
      var cmd = i > 0 ? 'L' : 'M';
      return cmd + station.x + ',' + station.y;
    });
    //console.log(this.loop);
    if (this.loop) {
      path.push('Z');
    }
    if (!path || path.length === 0) {
      path = ['M0,0'];
    }
    return path.join(' ');
  },
  update: function(status, content) {
    //console.log(status);
    status = status || this.status();
    content = content || this.content();
    this.status(status);
    this.content(content);
  },
  mouseOverPath: function(data, e) {
    //console.log('LineVM#mouseOverPath');
    this.selected(true);
    this.emit('mouseOver', this, e);
  },
  mouseOutPath: function(data, e) {
    //console.log('LineVM#mouseOutPath');
    this.selected(false);
    this.emit('mouseOut', this, e);
  },
  popout: function(e) {
    //console.log('LineVM#popout');
    //console.log(e);
  }
});

module.exports = LineVM;
