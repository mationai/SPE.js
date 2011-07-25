Simple Physics Engine in Javascript

Features:
- Standalone, requires no external libraries.
- Easy grouping of objects and collision policies.
- Can use canvas, SVG, WebGL, or even DHTML (demo #1 uses canvas).


Overview:

The Physics Engine is made up of a World, which contains Groups and Particles.

The World can set global attributes such as gravity and forces.

A Particle is the most basic form of object in the world.

Circle and Rectangle are Particle subclasses.

Group groups particles with similar attributes (what's collidable with what).
  Thus, groups are more like tags, not folders.

See each file's documentation for more info.

Run the demos to see it in action.

Look at the demos sources for usage.


Demos:

demo1-canvas.html - simple demo using canvas.
