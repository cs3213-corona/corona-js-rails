
/**
 * Controller.
 * Setups the model and view when its route is established.
 * Optional if application is small, use Router manually.
 */
Cjs._Controller = function() {};

/**
 * The router used with this Controller. In most cases, the
 * implementation does not need to override the default Router.
 */
Cjs._Controller.router = Cjs.Router;

/**
 * Default routes that will be automatically added
 * to the Router upon object creation. This is a
 * key-value pair of hash => function.
 *
 * The function can be either a string that represents
 * the name of the function in this Controller or a function.
 */
Cjs._Controller.routes = {};

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._Controller.init = function(args) {
};

/**
 * Triggered on every route event that disables the
 * "previousView" and enables the "currentView".
 */
Cjs._Controller._route = function(hash, params, args) {
  if(!_.isUndefined(this.previousView))
    this.previousView.setEnabled(false);
  if(!_.isUndefined(this.currentView))
    this.currentView.setEnabled(true);
};

/**
 * Public constructor.
 * @param properties Extended properties for this instance.
 */
Cjs.Controller = function(properties) {
  // Extended properties
  if(!_.isUndefined(properties)) {
    var that = this;
    _.each(properties, function(value, key) {
      that[key] = value;
    });
  }

  // Default values for mounted views
  this.previousView = undefined;
  this.currentView = undefined;

  // Subscribe to route events
  this.router.subscribe('route', '_route', this);

  // Register routes
  var that = this;
  _.each(this.routes, function(value, key) {
    that.router.register(key, value, that);
  });

  // Ignore first argument
  Cjs._shift.apply(arguments);
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.Controller.prototype, Cjs._Controller, Cjs._Event);
Cjs.Controller.extend = Cjs._extend;
