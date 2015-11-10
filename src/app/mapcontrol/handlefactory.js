
/*
 * MapControl/HandleFactory
 */

var MouseHandle = require('./handle/mousehandle');
var TouchHandle = require('./handle/touchhandle');

function isTouchDevice() {
  return 'ontouchstart' in document.documentElement;
}

function HandleFactory() {
  if (isTouchDevice()) {
    return new TouchHandle();
  } else {
    return new MouseHandle();
  }
}

module.exports = HandleFactory;

