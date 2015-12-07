
/*
 *   Screen
 */


var Screen = {
  scrollHeight: function() {
    // Ref. http://css-eblog.com/javascript/javascript-contents-height.html
    return Math.max.apply(null, [
      document.body.clientHeight,
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight
    ]);
  },
  scrollTop: function() {
    return document.documentElement.scrollTop || document.body.scrollTop;
  },
  clientWidth: function() {
    return window.innerWidth || document.documentElement.clientWidth;
  },
  clientHeight: function() {
    return window.innerHeight || document.documentElement.clientHeight;
  }
};

module.exports = Screen;

