
/**
 * CompositeView.
 * Keeps a collection of views to render at once.
 */
Cjs._CompositeView = function() {};

/**
 * Default views that will be automatically added to the
 * composite view upon object creation or when reset() is
 * called.
 */
Cjs._CompositeView.views = {};

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._CompositeView.init = function(args) {
};

/**
 * Adds a view to the composite.
 * Triggers:
 * - added: composite, name, view
 * @param name Name of added view
 * @param view View to add to the composite
 */
Cjs._CompositeView.add = function(name, view) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.CompositeView', 'Invalid parameter - name, string expected.');
    return;
  }

  if(!_.isUndefined(this._views[name])) {
    Cjs._log('Cjs.CompositeView', 'Cannot add existing view.');
    return;
  }

  // Add new view
  this._views[name] = view;

  // Fire added event
  this.trigger('added', this, name, view);
};

/**
 * Removes a view from the composite.
 * Triggers:
 * - removed: composite, name, view
 * @param name Name of view to remove from the composite
 * @return The old view if exists. Otherwise, undefined.
 */
Cjs._CompositeView.remove = function(name) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.CompositeView', 'Invalid parameter - name, string expected.');
    return undefined;
  }

  if(_.isUndefined(this._views[name])) {
    Cjs._log('Cjs.CompositeView', 'Cannot remove non-existent view.');
    return undefined;
  }

  // Delete old view
  var view = this._views[name];
  delete this._views[name];

  // Fire removed event
  this.trigger('removed', this, name, view);
  return view;
};

/**
 * Swaps a view in the composite.
 * Triggers:
 * - removed: composite, name, view
 * - added: composite, name, view
 * - swapped: composite, name, oldView, newView
 * @param name Name of swapped view
 * @param view View to swap in the composite
 * @return The old view if exists. Otherwise, undefined.
 */
Cjs._CompositeView.swap = function(name, view) {
  // Remove old view
  var oldView = this.remove(name);
  if(_.isUndefined(oldView))
    return undefined;
  
  // Add new view
  this.add(name, view);

  // Fire swapped event
  this.trigger('swapped', this, name, oldView, view);
  return oldView;
};

/**
 * Iterates through the composite calling back
 * the specified function. This is a shorthand version
 * of Underscore.js's _.each() functionality.
 * @param func Function to callback.
 */
Cjs._CompositeView.each = function(func) {
  if(!_.isFunction(func)) {
    Cjs._log('Cjs.CompositeView', 'Invalid parameter - func, function expected.');
    return;
  }

  _.each(this._views, func);
};

/**
 * Clears the composite and adds the
 * default views specified by views.
 * Triggers:
 * - reset: composite
 * - added: composite, view
 */
Cjs._CompositeView.reset = function() {
  this._views = {};
  this.trigger('reset', this);

  // Add default views
  var that = this;
  _.each(this.views, function(view, name) {
    that.add(name, view);
  });
};

/**
 * Checks if the view is enabled.
 * @return True if enabled. Otherwise, false.
 */
Cjs._CompositeView.isEnabled = function() {
  return this._isEnabled;
};

/**
 * Composite function that calls all views render().
 * Triggers:
 * - renderBefore: composite
 * - renderAfter: composite
 */
Cjs._CompositeView.render = function() {
  if(!this.isEnabled())
    return;

  this.trigger('renderBefore', this);
  this.each(function(view) {
    view.render();
  });
  this.trigger('renderAfter', this);
};

/**
 * Composite function that calls all views setEnabled().
 * Triggers:
 * - enabled: composite
 * - disabled: composite
 */
Cjs._CompositeView.setEnabled = function(enabled) {
  if(!_.isBoolean(enabled)) {
    Cjs._log('Cjs.CompositeView', 'Invalid parameter - enabled, boolean expected.');
    return;
  }

  // Don't do twice
  if(this._isEnabled === enabled)
    return;

  // Pass to all views in composite
  this._isEnabled = enabled;
  var that = this;

  this.each(function(view) {
    view.setEnabled(that._isEnabled);
  });

  // Enable
  if(this._isEnabled) {
    this.trigger('enabled', this);
  }

  // Disable
  else {
    this.trigger('disabled', this);
  }
};

/**
 * Composite function that calls all views _registerDomEvents().
 */
Cjs._CompositeView._registerDomEvents = function() {
  this.each(function(view) {
    view.registerDomEvents();
  });
};

/**
 * Composite function that calls all views _unregisterDomEvents().
 */
Cjs._CompositeView._unregisterDomEvents = function() {
  this.each(function(view) {
    view.unregisterDomEvents();
  });
};

/**
 * Public constructor.
 * @param properties Extended properties for this instance.
 */
Cjs.CompositeView = function(properties) {
  // Extended properties
  if(!_.isUndefined(properties)) {
    var that = this;
    _.each(properties, function(value, key) {
      that[key] = value;
    });
  }

  this._isEnabled = false;
  this.reset();

  // Ignore first argument
  Cjs._shift.apply(arguments);
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.CompositeView.prototype, Cjs._CompositeView, Cjs._Event);
Cjs.CompositeView.extend = Cjs._extend;
