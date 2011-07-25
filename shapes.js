/*
Shapes - Particle subclasses for Simple Physics Engine

Rect (Rectangle):
  Properties (Particle's properties plus):
    rotation - the angle of rotation
    wd, ht   - width and height of Rect
    halfWd   - half width of Rect
    halfHt   - half height of Rect

Circle:
  Only style property and isType() is override.

https://github.com/fuzzthink/SPE.js
*/

SPE.Rect = function(x0, y0, wd, ht) {
  this.setWdHt(wd, ht);

  SPE.Particle.call( this, x0+this.halfWd, y0+this.halfHt);
  this.rotation = 0;
  this.style = {
    shape: 'Rect',
    lineWidth: 1,
    lineColor: 'grey'
  };
};

SPE.Rect.prototype = new SPE.Particle();
SPE.Rect.prototype.constructor = SPE.Rect;

SPE.Rect.prototype.
  isType = function(Cls) {
    return Cls === SPE.Rect;
};

SPE.Rect.prototype.
  setWdHt = function(wd, ht) {
    this.wd = wd;
    this.ht = ht;
    this.halfWd = wd * 0.5;
    this.halfHt = ht * 0.5;
};
  
SPE.Rect.prototype.
  draw = function(fn) {
    var t = this;
    fn.call(null, t.style, t.x-t.halfWd, t.y-t.halfHt, t.wd, t.ht);
};


// Circle Particle:
//
SPE.Circle = function(x, y, radius, style) {
  SPE.Particle.call( this, x, y, radius );
  this.style = style || {
    shape: 'Circle',
    lineWidth: 1,
    lineColor: 'red',
    fillColor: 'grey'
  };
};

SPE.Circle.prototype = new SPE.Particle();
SPE.Circle.prototype.constructor = SPE.Circle;

SPE.Circle.prototype.
  isType = function(Cls) {
    return Cls === SPE.Circle;
};