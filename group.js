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