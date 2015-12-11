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
var Skin = require('./skin');
var Point = require('../geom/point');

var skin = Skin();
var ceil = Math.ceil;

function StationVM(o) {
  //console.log('StationVM#constructor');
  events.EventEmitter.call(this);

  this.map        = MapControlFactory();
  this.lat        = o.lat * 1;
  this.lng        = o.lng * 1;
  this.line       = [o.line];
  this.name       = o.name;
  this.postal     = o.postal;
  this.prefecture = o.prefecture;
  this.next       = [];
  this.prev       = [];
  this.x          = o.x * 1;
  this.y          = o.y * 1;
  this.points     = [new Point(this.x, this.y)];
  this.priority   = ko.observable(0);
  this.threshold  = ko.observable(0);
  this.selected = ko.observable(false);

  // computed variables
  this.visibility = ko.computed(this.computedVisibility.bind(this));
  this.className = ko.computed(this.computedClassName.bind(this));
  this.r = ko.computed(this.computedRadius.bind(this));

  this.addNext(o.next);
  this.addPrev(o.prev);
}
inherit(StationVM, events.EventEmitter);
extend(StationVM.prototype, {
  computedVisibility: function() {
    return this.map.scale() >= this.threshold() && this.priority() > 0;
  },
  computedClassName: function() {
    var clsname = 'station';
    if (this.isSelected()) {
      clsname += ' station--selected';
    }
    if (this.visibility()) {
      clsname += ' station--visible';
    }
    return clsname;
  },
  computedRadius: function() {
    return (1 + ceil(this.priority() / 3)) / this.map.scale();
  },
  averageLatLng: function(lat, lng) {
    this.lat = (this.lat + lat) / 2;
    this.lng = (this.lng + lng) / 2;
  },
  averagePos: function(x, y) {
    this.x = (this.x + x) / 2;
    this.y = (this.y + y) / 2;
  },
  addPoint: function(x, y) {
    var point = new Point(x, y);
    var registered = this.points.filter(function(p) {
      return point.x === p.x && point.y === p.y;
    });
    if (registered.length === 0) {
      this.points.push(point);
    }
  },
  addLine: function(name) {
    if (this.line.indexOf(name) === -1) {
      this.line.push(name);
    }
  },
  addNext: function(name) {
    if (name === null || name === 'null') {
      return;
    }
    if (this.next.indexOf(name) === -1) {
      this.next.push(name);
    }
  },
  addPrev: function(name) {
    if (name === null || name === 'null') {
      return;
    }
    if (this.prev.indexOf(name) === -1) {
      this.prev.push(name);
    }
  },
  isSelected: function() {
    return !!this.selected();
  },
  onMouseOver: function(e) {
    console.log('StationVM#onMouseOver');
    this.selected(true);
    this.emit('onStationSelected', this, e);
  },
  onMouseOut: function(e) {
    console.log('StationVM#onMouseOut');
    this.selected(false);
    this.emit('onStationRemoved', this, e);
  },
  setPriority: function() {
    this.priority(this.line.length);
    if (this.prev.length === 0 || this.next.length === 0) {
      this.priority(this.priority() + 1);
    }
  },
  setThreshold: function(min, max) {
    var p = this.priority();
    this.threshold(max - p - ceil(p / 2 - 1) + min);
  },
  getFontSize: function() {
    return (this.isSelected() ? skin.station.fontSizeSelected : skin.station.fontSize) / this.map.getScale();
  },
  getLabelY: function() {
    var top = this.points[0].y;
    this.points.forEach(function(P, i) {
      if (P.y < top) {
        top = P.y;
      }
    });
    return top - 1 - this.r() * 2 / this.map.getScale();
  },
  getStrokeWidth: function() {
    return (this.visibility() ? skin.station.strokeWidth : 1) / this.map.scale();
  },
  getPointPath: function() {
    //console.log('StationVM#getPointPath');
    var path = '';
    if (this.points.length === 1) {
      path = this.getSinglePoint2(this.points[0]);
    } else {
      path = this.getMultiPoints(this.points);
    }
    return path;
  },
  getSinglePoint: function(point) {
    //console.log('StationVM#getSinglePoint');
    var x = point.x;
    var y = point.y;
    var r = this.r();
    var path = '';
    path += 'M ';
    path += (x + 0) + ',' + (y - r) + ' ';
    path += 'A ';
    path += r + ',' + r + ' ';
    path += '0 1,1 ';
    path += (x + 0) + ',' + (y + r) + ' ';
    path += 'A ';
    path += r + ',' + r + ' ';
    path += '0 1,1 ';
    path += (x + 0) + ',' + (y - r) + ' ';
    path += 'Z';

    return path;
  },
  getSinglePoint2: function(point) {
    //console.log('StationVM#getPointRect');
    var path = '';
    path += 'M ';
    path += point.x + ',' + point.y + ' ';
    path += 'L ';
    path += (point.x + 0.01) + ',' + point.y + ' ';
    path += 'Z';

    return path;
  },
  getMultiPoints: function(points) {
    //console.log('StationVM#getPointRect');
    var path = '';
    path += 'M ';
    points.forEach(function(P, i) {
      if (i === 0) {
        path += P.x + ',' + P.y + ' ';
      } else {
        path += 'L ';
        path += P.x + ',' + P.y + ' ';
      }
    });
    path += 'Z';

    return path;
  },
  getPointRect: function(points) {
    //console.log('StationVM#getPointRect');
    var top = points[0].y;
    var right = points[0].x;
    var bottom = points[0].y;
    var left = points[0].x;
    var path = '';
    points.forEach(function(P, i) {
      if (P.y < top) {
        top = P.y;
      }
      if (bottom < P.y) {
        bottom = P.y;
      }
      if (P.x < left) {
        left = P.x;
      }
      if (right < P.x) {
        right = P.x;
      }
    });
    path += 'M ';
    path += left + ',' + top + ' ';
    path += 'L ';
    path += right + ',' + top + ' ';
    path += 'L ';
    path += right + ',' + bottom + ' ';
    path += 'L ';
    path += left + ',' + bottom + ' ';
    path += 'Z';
    console.log(path);

    return path;
  }
});

module.exports = StationVM;


