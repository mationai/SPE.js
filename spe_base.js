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