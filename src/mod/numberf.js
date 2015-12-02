
/*
 *  Number formatter
 */

function numberf(num, init) {
  if (typeof init !== 'number') {
    throw new Error('Initial value must be Number.');
  }
  if (typeof num === 'undefined' || num === null) {
    num = init;
  } else if (typeof num !== 'number') {
    throw new Error('Arguments must be Number.');
  }
  return num;
}

module.exports = numberf;
