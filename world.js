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