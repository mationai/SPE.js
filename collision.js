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