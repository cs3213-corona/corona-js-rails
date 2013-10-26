
var Cjs = function() {};

Cjs._version = function() {
  return '0.1';
};

/**
 * Default logging method. This is done so that console logging can easily be disabled.
 * @param title Title.
 * @param msg Message.
 */
Cjs._log = function(title, msg) {
  /*
  // Shorten title if too long
  if(title.length > 16)
    title = '\u2026' + title.substring(title.length-16, title.length);
  // Lengthen title if too short
  title += ':';
  while(title.length < 20)
    title += ' ';
  console.log(title + msg);
  */
};

/**
 * Allows Cjs objects to be extended by the implementation.
 * This function was referenced from Backbone.js.
 */
Cjs._extend = function(type) {
  var parent = this;
  var child = function() {
    return parent.apply(this, arguments);
  };

  var surrogate = function() {
    this.constructor = child;
  };
  surrogate.prototype = parent.prototype;
  child.prototype = new surrogate;

  _.extend(child.prototype, type);
  return child;
};

/**
 * Cache the array shift method. This is used to evaluate
 * arguments and "pop" them off the front of the array.
 */
Cjs._shift = [].shift;
