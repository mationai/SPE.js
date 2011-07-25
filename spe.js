// Simple Physics Engine (generated single file)

//============================ spe_base.js =============================

/*
spe_base - Defines SPE namespace, constants, and utils for Simple Physics Engine

https://github.com/fuzzthink/SPE.js
*/

var SPE = SPE || {};

SPE.CONST = {
  NONE  : 0,
  TOP   : 1,
  LEFT  : 2,
  RIGHT : 3,
  BOTTOM: 4,
  DIAG  : 5
};

SPE.inArray = function(obj, array) {
// returns if obj is in array or not
  return array.indexOf(obj) !== -1;
};

SPE.toArray = function(args) {
// Use(ful) for converting arguments (pass it directly) to true Array
  if ((args.length == 1) && (args[0] instanceof Array))
    return args[0];
  else
    return [].slice.call(args);
};

SPE.extend = function(obj, newProps) {
// extends obj with prooperties in newProps
 var p;
  for (p in newProps) {
    obj[p] = newProps[p];
  }
  return obj;
};

SPE.add = function(obj, toObj) {
// adds obj to toObj (only if obj not in toObj already).
  if (toObj instanceof Array) {
    if (toObj.indexOf(obj) === -1)
      toObj.push(obj);
  }
  else if (toObj !== undefined) { // Object
    SPE.extend(toObj, obj);
  }
};

SPE.remove = function(obj, fromObj) {
// removes obj from fromObj
  if (fromObj instanceof Array) {
    var i = fromObj.indexOf(obj);
    if (i !== -1)
      fromObj.splice(i, 1);
  }
  else if (fromObj !== undefined) { // Object
    delete fromObj[obj];
  }
};


//============================ math.js =============================

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


//============================ vector.js =============================

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



//============================ world.js =============================

/*
World - Physical World for Simple Physics Engine

 Properties (treat as private, use appropriate methods instead):
  groups    - Array of groups of particles.
    methods:  add(), remove()

  particles - Array of particles not belonging to any group.
    methods:  add(), remove()

  force     - Summation of global force experienced in the world.
    methods:  addForce(), setForce()

  masslessForce - Summation of global force where mass of objects can be
                   ignored, like gravity.
    methods:      addMasslessForce(), setMasslessForce() 

  damping       - (x,y) force vector, use for slowing down movement if things
                   get too fast.  Ranges from 0 to 1. General effects of values:
                   0: no movement
                   0.1 - 0.9: very slow movements
                   0.9 - 0.99: slow
                   1: no damping
    methods:      setDampling
  
  step(time)     - Call this with time passed as 1 / framesPerSec to run the 
                    engine. It will steps through all gropus & particles added,
                    which takes care of collision resolution automatically.
  
  draw()         - Calls all groups and particles added to draw itself.

https://github.com/fuzzthink/SPE.js
*/

SPE.World = function() {
  this.groups = [];
  this.particles = [];
  this.force = new SPE.Vector();
  this.masslessForce = new SPE.Vector();
  this.damping = new SPE.Vector(1, 1);
};

SPE.World.prototype = {

  add: function(group_s__or__particle_s) {
    SPE.toArray(arguments).forEach( function(gp) {
      if (gp instanceof SPE.Particle) {
        SPE.add(gp, this.particles);
        gp.setWorld(world);
      }  
      else if (gp instanceof SPE.Group) {
        SPE.add(gp, this.groups);
      }
      else throw TypeError("Only particle(s) or group(s) can be added to world.");
    }, this);
  },

  remove: function(group_s__or__particle_s) {
    SPE.toArray(arguments).forEach( function(gp) {
      if (gp instanceof SPE.Particle)
        SPE.remove(gp, this.particles);

      else if (gp instanceof SPE.Group)
        SPE.remove(gp, this.groups);

      else throw TypeError("Only particle(s) or group(s) can be removed from world.");
    }, this);
  },
  
  addForce: function(vtr_or_x, y) {
    this.force.doAdd(vtr_or_x, y);
  },
  setForce: function(vtr_or_x, y) {
    this.force.setTo(vtr_or_x, y);
  },
  
  addMasslessForce: function(vtr_or_x, y) {
    this.masslessForce.doAdd(vtr_or_x, y);
  },
  setMasslessForce: function(vtr_or_x, y) {
    this.masslessForce.setTo(vtr_or_x, y);
  },
  
  setDamping: function(vtr_or_x, y){
    this.damping.setTo(vtr_or_x, y);
  },
  
  step: function(time) {
    this.particles.forEach( function(p){ p.step(time); });
    this.groups.forEach( function(g){ g.step(time); });
  },
  
  draw: function(fn){
    this.particles.forEach( function(p){ p.draw(fn); });
    this.groups.forEach( function(g){ g.draw(fn); });
  }
};


//============================ collision.js =============================

/*
Collision Dectection & Resolution for Simple Physics Engine

https://github.com/fuzzthink/SPE.js
*/

SPE.Collision = {

  collide: function(p1, p2) {
    if (p1.isFixed && p2.isFixed)
      return;

    else if ((p1 instanceof SPE.Circle && p2 instanceof SPE.Rect) ||
             (p1 instanceof SPE.Rect && p2 instanceof SPE.Circle))
      SPE.Collision.resolveCircleVsFixedAABB(p1, p2);

    else if ((p1 instanceof SPE.Particle && p2 instanceof SPE.Rect) ||
             (p1 instanceof SPE.Rect && p2 instanceof SPE.Particle))
      SPE.Collision.resolveParticleVsFixedAABB(p1, p2);

    //else console.log("Only Particle/Circle vs. fixed Rectangle collision is supported now.");
  },
  
  resolveParticleVsFixedAABB: function(p1, p2) {
  // Particle vs. Fixed AABB (Axis Aligned Bounding Box), similar to 
  //   resolveCircleVsFixedAABB(), but with much less expensive operations.
  // Note: Not for high speed (velocity of ~35-50) collisions.
  // BUG: Saw a particle "escape" out of a box when bounce into lower right
  //      corner at ~ 5 o'clock.
    var
      p = p1 instanceof SPE.Particle? p1 : p2,
      r = p1 instanceof SPE.Rect? p1 : p2,
      // save as previous positions:
      prvx = p.x - p.dx,
      prvy = p.y - p.dy,

      // rectangle (AABB)'s positions:
      r_x0 = r.x - r.halfWd,
      r_x1 = r.x + r.halfWd,
      r_y0 = r.y - r.halfHt,
      r_y1 = r.y + r.halfHt,
      inRectPrv = prvx.isBtw(r_x0,r_x1) && prvy.isBtw(r_y0,r_y1),
      inRectCur = p.x.isBtw(r_x0,r_x1)  && p.y.isBtw(r_y0,r_y1),

      C = SPE.CONST,
      bounce = C.NONE,

      // assigned later:
      inx, iny, outx, outy, // x,y inside/outside the Rectangle
      slope,
      topLeftSlope, topRightSlope, btmRightSlope, btmLeftSlope;


    if ( inRectPrv == inRectCur ) //no collision
      return;

    inx  = inRectPrv? prvx : p.x;
    iny  = inRectPrv? prvy : p.y;
    outx = inRectPrv? p.x : prvx;
    outy = inRectPrv? p.y : prvy;

    slope = SPE.Math.slope(inx, iny, outx, outy);
    //slope from the x,y coords inside the Rect to 4 corners:
    topLeftSlope  = SPE.Math.slope(inx,iny, r_x0,r_y0);
    topRightSlope = SPE.Math.slope(inx,iny, r_x1,r_y0);
    btmRightSlope = SPE.Math.slope(inx,iny, r_x1,r_y1);
    btmLeftSlope  = SPE.Math.slope(inx,iny, r_x0,r_y1);

    //slope comparisons may seem "reversed" due to y being positive down
    if      ((slope > topLeftSlope  && outy <= r_y0) ||
             (slope < topRightSlope && outy <= r_y0) ||
             (p.dx == 0             && outy <= r_y0))  bounce = C.TOP;
    else if ((slope < btmLeftSlope  && outy >= r_y1) ||
             (slope > btmRightSlope && outy >= r_y1) ||
             (p.dx == 0             && outy >= r_y1))  bounce = C.BOTTOM;
    else if ((slope < topLeftSlope  && outx <= r_x0) ||
             (slope > btmLeftSlope  && outx <= r_x0) ||
             (p.dy == 0             && outx <= r_x0))  bounce = C.LEFT;
    else if ((slope > topRightSlope && outx >= r_x1) ||
             (slope < btmRightSlope && outx >= r_x1) ||
             (p.dy == 0             && outx >= r_x1))  bounce = C.RIGHT;
    else throw Error("Unknown bounce in resolveParticleVsFixedAB.")
    
    //Resolution:
    if (bounce == C.TOP) {
      p.vel.y *= -1;
      p.y = p.dy>0 ? r_y0-p.radius : r_y0+p.radius;
    }
    else if (bounce == C.LEFT) {
      p.vel.x *= -1;
      p.x = p.dx>0 ? r_x0-p.radius : r_x0+p.radius;
    }
    else if (bounce == C.RIGHT) {
      p.vel.x *= -1;
      p.x = p.dx<0 ? r_x1+p.radius : r_x1-p.radius;
    }
    else { //(bounce == C.BOTTOM)
      p.vel.y *= -1;
      p.y = p.dy<0 ? r_y1+p.radius : r_y1-p.radius;
    }
  },
  
  resolveCircleVsFixedAABB: function(p1, p2){ 
  // Circle vs. Fixed AABB (Axis Aligned Bounding Box)
  //  Note: Direct corner bounces are not real, but is a good as it gets
  //         without expensive computations.
  //        Not for high speed (velocity of ~35-50) collisions.

    var
      c = p1 instanceof SPE.Circle? p1 : p2,
      r = p1 instanceof SPE.Rect? p1 : p2,

      dSqr  = SPE.Math.distSqr,
      ratio = SPE.Math.ratio,
      sameSign = SPE.Math.sameSign,
      rad  = c.radius,
      rSqr = rad*rad,
      C = SPE.CONST,
      bounce = C.NONE,

      // Circle's 4 min max x, y values
      minx = c.x - rad,
      maxx = c.x + rad,
      miny = c.y - rad,
      maxy = c.y + rad,

      // Rectangle's upper left, lower right x, y values
      r_x0 = r.x - r.halfWd,
      r_x1 = r.x + r.halfWd,
      r_y0 = r.y - r.halfHt,
      r_y1 = r.y + r.halfHt,

      // touched? quick test logic:
      tchTop = r_y0.isBtw(miny,maxy) && maxx >= r_x0 && minx <= r_x1,
      tchBtm = r_y1.isBtw(miny,maxy) && maxx >= r_x0 && minx <= r_x1,
      tchLft = r_x0.isBtw(minx,maxx) && maxy >= r_y0 && miny <= r_y1,
      tchRgt = r_x1.isBtw(minx,maxx) && maxy >= r_y0 && miny <= r_y1,

      // assigned later:
      tchTopLeft, tchTopRight, tchBtmLeft, tchBtmRight, circleInRect;


    if ( !(tchTop || tchBtm || tchLft || tchRgt) )  //no collision
      return;

    else{
      // tch* are just quick tests.  If circle lies just outside of corner it 
      // may still register a touch even though it may not actually touched 
      // the corner, so need a distance from center of circle to corner test:

      tchTopLeft  = tchTop && tchLft && dSqr(c.x, c.y, r_x0, r_y0) < rSqr;
      tchTopRight = tchTop && tchRgt && dSqr(c.x, c.y, r_x1, r_y0) < rSqr;
      tchBtmLeft  = tchBtm && tchLft && dSqr(c.x, c.y, r_x0, r_y1) < rSqr;
      tchBtmRight = tchBtm && tchRgt && dSqr(c.x, c.y, r_x1, r_y1) < rSqr;
      circleInRect = c.x > r_x0 && c.x < r_x1 && c.y > r_y0 && c.y < r_y1;
      
      // Corner tests for false positives: circle lies just outside of corners but didn't touch them yet
      if ((c.x < r_x0 && c.y < r_y0 && !tchTopLeft) ||
          (c.x < r_x0 && c.y > r_y1 && !tchBtmLeft) ||
          (c.x > r_x1 && c.y < r_y0 && !tchTopRight) ||
          (c.x > r_x1 && c.y > r_y1 && !tchBtmRight))
          return;
          
      // Corner tests, using (tch* && tch*) instead of tch**Corner because it
      //  also takes care of cases where circle is in Rectangle where it touches
      //  both lines but not the corner yet.
      if ((tchTop && tchLft) || (tchTop && tchRgt) || 
          (tchBtm && tchLft) || (tchBtm && tchRgt)) {

        var DIAG_RATIO = 2; // ratio to be considered a direct diagonal bounce

        if (circleInRect) {
          bounce = this.DIAG;
        }
        else if (tchTop && tchLft) {
          if (c.dx > 0 && c.dy > 0 && ratio(c.dx,c.dy) < DIAG_RATIO && 
                                      ratio(maxx-r_x0, maxy-r_y0) < DIAG_RATIO){
            bounce = this.DIAG;
          }
          else if (c.dx <= 0 || (c.dy > 0 && maxx-r_x0 > maxy-r_y0) ) {
            bounce = C.TOP;
          }
          else
            bounce = C.LEFT;
        }
        else if (tchBtm && tchLft) {
          if (c.dx > 0 && c.dy < 0 && ratio(c.dx,c.dy) < DIAG_RATIO &&
                                      ratio(maxx-r_x0, r_y1-miny) < DIAG_RATIO){
            bounce = C.DIAG;
          }
          else if (c.dx <= 0 || (c.dy < 0 && maxx-r_x0 > r_y1-miny) ) {
            bounce = C.BOTTOM;
          }
          else
            bounce = C.LEFT;
        }
        else if (tchTop && tchRgt) {
          if (c.dx < 0 && c.dy > 0 && ratio(c.dx,c.dy) < DIAG_RATIO &&
                                      ratio(r_x1-minx, maxy-r_y0) < DIAG_RATIO){
            bounce = C.DIAG;
          }
          else if (c.dx >= 0 || (c.dy > 0 && r_x1-minx > maxy-r_y0) ) {
            bounce = C.TOP;
          }
          else
            bounce = C.RIGHT;
        }
        else if (tchBtm && tchRgt) {
          if (c.dx < 0 && c.dy < 0 && ratio(c.dx,c.dy) < DIAG_RATIO &&
                                      ratio(r_x1-minx, r_y1-miny) < DIAG_RATIO){
            bounce = C.DIAG;
          }
          else if (c.dx >= 0 || (c.dy < 0 && r_x1-minx > r_y1-miny) ) {
            bounce = C.BOTTOM;
          }
          else
            bounce = C.RIGHT;
        }
        else throw Error("Unknown state in corner test of resolveCircleVsFixedAABB.")
      }
      else if (tchTop) bounce = C.TOP;
      else if (tchBtm) bounce = C.BOTTOM;
      else if (tchLft) bounce = C.LEFT;
      else             bounce = C.RIGHT;
      
      //Resolution:
      if (bounce == C.TOP) {
        c.vel.y *= -1;
        c.y = r_y0 + (circleInRect ? rad : -rad);
      }
      else if (bounce == C.LEFT) {
        c.vel.x *= -1;
        c.x = r_x0 + (circleInRect ? rad : -rad);
      }
      else if (bounce == C.RIGHT) {
        c.vel.x *= -1;
        c.x = r_x1 + (circleInRect ? -rad : rad);
      }
      else if (bounce == C.BOTTOM) {
        c.vel.y *= -1;
        c.y = r_y1 + (circleInRect ? -rad : rad);
      }
      else { //(bounce == DIAG) {
        c.vel.x = sameSign(c.vel.x, c.vel.y) ? -c.vel.y : c.vel.y; 
        c.vel.y = sameSign(c.vel.x, c.vel.y) ? -c.vel.x : c.vel.x;
        //real relocation too expensive, hence dividing by 2:
        c.x += sameSign(c.dx,c.dy) ? -c.dy/2 : c.dy/2; 
        c.y += sameSign(c.dx,c.dy) ? -c.dx/2 : c.dx/2;
      }
    }
  }
};


//============================ group.js =============================

/*
Group - groups particles with similar attributes (what's collidable with what).
  Thus, groups are more like tags, not folders.

  Properties (treat as private, use appropriate methods instead):
    world     - The world this group and its particles observe physics in.
      methods:  setWorld()

    particles - group's particles.
      methods:  add(), remove()

    collidingGroups   - Groups this group is collidable with.
      methods:          setCollideWith()
       
    collideInternally - Particles are collidable with each other or not.
      methods:          setCollideWith()

    collideAll        - Once set, group will collide with all particles added
                        to the world before and in the future.
      methods:          setCollideWith()

  Other Methods (that sets all current particle's properties):
    setFixed(boolean)
    setCenter(x, y)
    setVelocity(x, y)
    setSpeedInRadians(speed, radians)
    setSpeedInDegrees(speed, degrees)
    setAcceleration(x, y)
    setMass(mass)
    obeyMasslessForce(boolean)
  
  Other Methods:
    doCollision() - Called by step()
    step() - Steps through each particle in the group
    draw() - Calles all particle to draw()

https://github.com/fuzzthink/SPE.js
*/

SPE.Group = function(world) {

  this.world = world;
  this.particles = [];
  this.collidingGroups = [];
  this.collideInternally = false;
  this.collideAll  = false;
};

SPE.Group.prototype = {  

  setWorld: function(world) {
    this.world = world;
    this.particles.forEach( function(p){ p.setWorld(world); });
  },
  
  setFixed: function(bool) {
    bool = (bool === undefined) ? true : bool;
    this.particles.forEach( function(p){ p.setFixed(bool); });
  },

  setCenter: function(x, y) {
    if (this.collideInternally)
      throw Error("Internally collidable group can not have all particles be at the same location.");
    else this.particles.forEach( function(p){ p.setCenter(x,y); });
  },

  setVelocity: function(x, y) {
    this.particles.forEach( function(p){ p.setVelocity(x,y); });
  },
  
  setSpeedInRadians: function(speed, radians) {
    this.particles.forEach( function(p){ p.setSpeedInRadians(speed,radians); });
  },

  setSpeedInDegrees: function(speed, degrees) {
    this.particles.forEach( function(p){ p.setSpeedInDegrees(speed,degrees); });
  },
  
  setAcceleration: function(x, y){
    this.particles.forEach( function(p){ p.setAcceleration(x,y); });
  },
  
  setMass: function(mass) {
    this.particles.forEach( function(p){ p.setMass(mass); });
  },
  
  obeyMasslessForce: function(bool) {
    this.particles.forEach( function(p){ p.obeyMasslessForce(bool); });
  },

  add: function(group_s__or__particle_s) {
    SPE.toArray(arguments).forEach( function(gp) {
      if (gp instanceof SPE.Particle) {
        SPE.add(gp, this.particles);
        gp.setWorld(this.world);
      }
      else if (gp instanceof SPE.Group) {
        this.add(gp.particles);
      }
      else throw Error("group can only add particle(s)/group(s), not: "+gp);
    }, this);
  },

  remove: function(particle_s) {
    SPE.toArray(arguments).forEach( function(p) {
      if ( !(p instanceof SPE.Particle) )
        throw TypeError("Only Particle(s) can be removed from group.");
      SPE.remove(p, this.particles);
    }, this);
  },

  setCollideWith: function(group_s__or__particle_s) {
  // Sets the group(s) or particle(s) this group can collide with.
  // Valid arg is:
  //  'none' - This group is collision-isolated from all current and future
  //            groups and objects within this group.           
  //  'self' - All current and future objects added to this group are
  //            collidable.
  //  'allGroups' - This group can collide with all current and future groups.
  //  group(s) - sets group or groups this group can collide with.
  //  particle(s) - an anonymous group will be created to add to collidingGroups

    SPE.toArray(arguments).forEach( function(what) {
      if (what === 'self' || what === this)
        this.collideInternally = true;

      else if (what == 'allGroups')
        this.collideAll = true;
        
      else if (what == 'none' ) {
        this.collideAll  = false;
        this.collidingGroups  = [];
      }
      else if (what instanceof SPE.Group)
        SPE.add(what, this.collidingGroups);

      else if (what instanceof SPE.Particle) { // enclose particle to a group
        var newGroup = new SPE.Group(this.world);
        newGroup.add(what);
        SPE.add(newGroup, this.collidingGroups);
      }
      else throw TypeError("Invalid arg for setCollideWith(): "+what);      
    }, this);
  },

  doCollisions: function() {
  // start collision detection and resolution, to be called at end of every frame
    var i, j,
      allGroups = this.world.groups,
      nObjs = this.particles.length,
      groups = this.collideAll? allGroups : this.collidingGroups,
      nGroups = groups.length;

    for (i = 0; i < nGroups; i++)
      for (j = 0; j < nObjs; j++)
        if ( (groups[i] !== this) ||
            ((groups[i] === this) && this.collideInternally) )
          this.particles[j].collide( groups[i] );
  },

  step: function(time){
  // makes each particle take a step & doCollisions().  Called by the world
    this.particles.forEach( function(p){ p.step(time); });
    this.doCollisions();
  },

  draw: function(fn){
    this.particles.forEach( function(p){ p.draw(fn); });
  }
};


//============================ particle.js =============================

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


//============================ shapes.js =============================

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


