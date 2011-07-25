/* 
Math utils for Simple Physics Engine

https://github.com/fuzzthink/SPE.js
*/

SPE.Math = {

  PI_over_180: Math.PI/180,


  randMinMax: function(min,max) {
  // random number between min and max
    return Math.random()*(max-min)+min;
  },

  randValRange: function(val, range) {
  // random number between val +- range
    return Math.random() * (range*2) + val-range;
  },

  sameSign: function(x, y) {
  // returns if x & y has the same sign or not
    return ((x >= 0 && y >= 0) || (x <= 0 && y <= 0)) ? true : false;
  },

  dist: function(x0, y0, x1, y1) {
  // distance between 2 points
    return Math.sqrt( (y0-y1)*(y0-y1) + (x0-x1)*(x0-x1) );
  },

  distSqr: function(x0, y0, x1, y1) {
    return (y0-y1)*(y0-y1) + (x0-x1)*(x0-x1);
  },

  ratio: function(n1, n2) {
  // returns larger of the 2 args divided by smaller
    return Math.max(n1, n2) / Math.min(n1, n2);
  },

  slope: function(x0, y0, x1, y1) {
  // Slope of the 2 pts
  // Note: Slope seems "negated" since y is positvie down.
    if (x0 != x1) 
      return (y0 - y1)/(x0 - x1);
    else if (y0 > y1) 
      return Number.POSITIVE_INFINITY;
    else 
      return Number.NEGATIVE_INFINITY;
  }
};

// Extending javascript:

// Returns number is between n1 & n2 or not
// Rational: readability for num.isBtw(a, b) outweights "don't extend js" rule.
Number.prototype.isBtw = function(n1, n2, exclusive) {
  if (exclusive)
    return this > n1 && this < n2;
  else
    return this >= n1 && this <= n2;
};