/*
Particle - The most abstract form of object in Simple Physics Engine

  Properties (treat as private, use appropriate methods instead):
    x, y    - particle's center position
    radius  - radius for particle, set by setRadius() or constructor
    dx,dy   - x, y positional changes from previous frame
    vel     - velocity, use setVelocity()
    acl     - acceleration, use setAcceleration()
    world   - the world the particle observe physics in, use setWorld()
    isFixed - if the particle can move or not, use setFixed()
    obeyWMF - obey World's masslessForce or not, use obeyMasslessForce()
    mass    - mass of the particle, use setMass()
    style   - drawing style properties, use setStyle()
    collidedList - tmp var to keep track of particles collided in each step.

  Other Methods:
    collide()  - Do collisions, called by step().
    step(time) - Calculates position, velocity, and acceleration.
    draw(fn)   - Draws itself using drawing function passed in.

https://github.com/fuzzthink/SPE.js
*/

SPE.Particle = function(x, y, radius) {
  this.x = x;
  this.y = y;
  this.dx = 0;
  this.dy = 0;
  this.vel = new SPE.Vector();
  this.acl = new SPE.Vector();
  this.world = null;
  this.isFixed = false;
  this.obeyWMF = 1;
  this.mass    = 1;
  this.invMass = 1;
  this.radius  = radius || 3;
  this.style = {
    shape: 'Particle',
    lineWidth: 1,
    lineColor: 'grey',
    fillColor: 'grey'
  };
  this.collidedList = [];
};

SPE.Particle.prototype = {

  isType: function(Cls) {
  // tests if instance is of class Cls.  Subclasses MUST override this.
    return Cls === SPE.Particle;
  },

  setWorld: function(world) { this.world = world; },
  setRadius: function(rad) { this.radius = rad; },

  resetCenter: function(x, y) {
  // For initializing position.
  // Do not use for user interactive movements since velocity
  //  and acceleration changes will need to be stored to make interactive
  //  movements real, which will be done in another method.
    this.x = x;
    this.y = y;
  },
  
  setVelocity: function(x, y) {
    this.vel.x = x;
    this.vel.y = y;
  },
  
  setSpeedInRadians: function(speed, radians) {
    this.vel.x = speed * Math.cos(radians);
    this.vel.y = speed * Math.sin(radians);
  },
  
  setSpeedInDegrees: function(speed, degrees) {
    this.vel.x = speed * Math.cos(degrees*SPE.Math.PI_over_180);
    this.vel.y = speed * Math.sin(degrees*SPE.Math.PI_over_180);
  },
  
  setMass: function(mass) {
    if (mass === 0) throw RangeError("mass can not be set to 0");
    this.mass = mass;
    this.invMass = 1/mass;
  },
  
  setFixed: function(bool) {
    bool = (bool === undefined) ? true : bool;
    this.isFixed = bool; 
  },
  
  obeyMasslessForce: function(bool) {
    bool = (bool === undefined) ? true : bool;
    this.obeyWMF = bool ? 1 : 0; 
  },

  collide: function(what) {
    if (what instanceof SPE.Particle) {
      this._collideParticle(what);
    }
    else if (what instanceof SPE.Group) {
      what.particles.forEach( function(p) {
        this._collideParticle(p);
      }, this);
    }
    else throw Error("Unsupported object in particle.collide: "+what);
  },

  _collideParticle: function(p) {
    if (p !== this && !SPE.inArray(p, this.collidedList) ) {
      SPE.Collision.collide(this, p);
      this.collidedList.push(p);
    }
  },

  step: function(time){ 
    if (this.isFixed)
      return;
    this._stepAcceleration();
    this._stepVelocity(time);
    this._stepPosition(time);
    this._resetCollidedList();
  },

  _stepAcceleration: function(){
    var g = this.world.masslessForce;
    this.acl.x = g.x * this.obeyWMF + this.world.force.x * this.invMass;
    this.acl.y = g.y * this.obeyWMF + this.world.force.y * this.invMass;
  },
  
  _stepVelocity: function(time) { // updates velocity: v += a*t
    var damping = this.world.damping;

    if (this.acl.x) this.vel.x += this.acl.x * time;
    if (this.acl.y) this.vel.y += this.acl.y * time;

    //add drag:
    if (damping.x) this.vel.x *= damping.x;
    if (damping.y) this.vel.y *= damping.y;
  },
  
  _stepPosition: function(time) { //updates position: p += v*t
    this.dx = this.vel.x*time;
    this.dy = this.vel.y*time;
    this.x += this.dx;
    this.y += this.dy;
  },

  _resetCollidedList: function() {
    this.collidedList = [];
  },

  setStyle: function(style) {
  // Sets drawing style for particle
  //  Note: html canvas will ignore lineWidth of 0 and use previous object's
  //        lineWidth instead.  This will cause much debugging headache so 
  //        removing the lineWidth attrib if it's set to 0 and let the user
  //        check if the lineWidth attrib exists instead.
    SPE.extend(this.style, style);
    if (style.lineWidth) {
      if      (style.lineWidth < 0) throw RangeError("lineWidth can not be < 0.");
      else if (style.lineWidth == 0) SPE.remove('lineWidth', this.style);
    }
    if (this.style['fillColor'] === 'none') SPE.remove('fillColor', this.style);
  },

  draw: function(fn) {
    fn.call(null, this.style, this.x, this.y, this.radius);
  }
};