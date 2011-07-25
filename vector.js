/* 
Vector class for Simple Physics Engine

https://github.com/fuzzthink/SPE.js
*/

SPE.Vector = function(x, y){
  this.x = x || 0;
  this.y = y || 0;
};

SPE.Vector.prototype = {
  
  setTo: function(vtr_or_x, y) {
    v = this.toVector(vtr_or_x, y); 
    this.x = v.x;
    this.y = v.y;
  },

  magnitude: function(){
    return Math.sqrt(this.x*this.x + this.y*this.y) || 0.000001;
  },
  
  magnitudeSqr: function() {
    return this.x*this.x + this.y*this.y;
  },
  
  normal: function() {
    var mag = this.magnitude();
    return new Vector(this.x/mag, this.y/mag);
  },
  
  normalize: function() {
    var mag = this.magnitude();
    this.x /= mag;
    this.y /= mag;
    return this;
  },

  add: function(vtr_or_x, y) {
    var v = this.toVector(vtr_or_x, y);
    this.x += v.x;
    this.y += v.y;
  },

  dot: function(vtr_or_x, y) { // Dot (aka scalar) product, returns a number
    var v = this.toVector(vtr_or_x, y);
    return this.x*v.x + this.y*v.y; 
  },

  X: function(vtr_or_x, y) { // Cross (aka vector) product, returns Vector
    var v = this.toVector(vtr_or_x, y);
    return new Vector(this.x*v.x - this.y*v.y,  this.x*v.y - this.y*v.x);
  },

  toVector: function(vtr_or_x, y){
    if (vtr_or_x instanceof SPE.Vector)
      return vtr_or_x;
    
    else if ( (typeof vtr_or_x == 'number') && (typeof y == 'number') )
      return new Vector(vtr_or_x, y);

    else if (vtr_or_x === undefined && y === undefined)
      return new Vector();

    else throw Error("Unexpected toVector() args: " + vtr_or_x + ", " + y);
  }
};
