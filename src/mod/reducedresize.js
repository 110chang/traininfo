
/*
*   ReducedResize r1
*/


// external libraries
var $ = jQuery = require('jquery');
var Browser = require('./browser');

var resizeEvent = Browser().nonPC() ? 'orientationchange' : 'resize';
var timer = false;
var event = new $.Event('reducedResize');

$(window).on(resizeEvent, function(e) {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(function() {
    $(window).trigger(event);
  }, 125);
});
