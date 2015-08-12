
/*
 * MapControlFactory
 */

var MouseMapControl = require('./mapcontrol/mousemapcontrol');
var TouchMapControl = require('./mapcontrol/touchmapcontrol');

function isTouchDevice() {
  return 'ontouchstart' in document.documentElement;
}

function MapControlFactory() {
  if (isTouchDevice()) {
    return new TouchMapControl();
  } else {
    return new MouseMapControl();
  }
}

module.exports = MapControlFactory;

