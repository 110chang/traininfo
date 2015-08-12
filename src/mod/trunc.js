
/*
 * extend Math.trunk
 */

var floor = Math.floor;
var pow = Math.pow;

if (Math.trunc) {
  Math._trunc = Math.trunc;
}
Math.trunc = function(n, d) {/* number, digit */
  var dd = pow(10, d);
  return floor(n * dd) / dd;
};

module.exports = Math.trunc;
