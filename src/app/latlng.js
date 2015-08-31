
/*
 * latlng
 */

var extend = require('extend');

function LatLng(a, b) {
  if (!(this instanceof LatLng)) {
    return new LatLng(a, b);
  }
  if (b === undefined) {
    if (a.lat !== undefined && a.lng !== undefined) {
      return new LatLng(a.lat, a.lng);
    } else {
      throw new Error('Invalid arguments');
    }
  } else if (a && b) {
    this._setup(a, b);
  } else {
    throw new Error('Invalid arguments');
  }
  
  return this;
}
extend(LatLng.prototype, {
  _setup: function (lat, lng) {
    if (typeof lat === 'number' && typeof lng === 'number') {
      this.lat = lat.toFixed(5) * 1;
      this.lng = lng.toFixed(5) * 1;
    } else {
      throw new Error('Arguments must be Number');
    }
  }
});

module.exports = LatLng;
