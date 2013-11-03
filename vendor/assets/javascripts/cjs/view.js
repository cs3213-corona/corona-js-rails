
/**
 * View.
 * Renders HTML based on a given template.
 * Has events to respond to DOM callbacks.
 */
Cjs._View = function() {};

/**
 * HTML element identifier. jQuery is used to formulate a
 * $element based on this at object construction. If at object
 * construction $element does not exist, the element is
 * assumed to be uncachable and thus, the default render
 * method will automatically retrieve the $element at
 * each render.
 */
Cjs._View.element = undefined;

/**
 * HTML template URL using Underscore.js templating system.
 * This will be used to create $template upon object construction.
 * $template is the template string that can be used with
 * Underscore.js or with the build() function.
 */
Cjs._View.template = undefined;

/**
 * HTML DOM events. These events can be registered when the Router
 * launches this View and unregistered when the Router launches another
 * View via the Controller. To override, register DOM events manually
 * via on() and off(). This is a property object that takes in
 * "event selector" as a key and a function as the subscriber.
 */
Cjs._View.dom = {};

/**
 * Model to build. The model object will be built
 * in the build() function if it is defined.
 */
Cjs._View.model = undefined;

/**
 * Collection to build. The collection object will be built
 * in the build() function if it is defined. Do note that,
 * if the model and collection object is defined, only the
 * model object will be built, unless it is overridden.
 */
Cjs._View.collection = undefined;

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._View.init = function(args) {
};

/**
 * Build HTML from JSON data and create a resulting HTML string.
 * @param json Data in JSON format. If undefined, automatically picks from model or collection attribute.
 */
Cjs._View.build = function(json) {
  if(_.isUndefined(this.template)) {
    Cjs._log('Cjs.View', 'Undefined template found.');
    return undefined;
  }

  if(_.isUndefined(json)) {
    if(!_.isUndefined(this.model)) {
      // Build HTML string from model
      return _.template(this.$template, this.model.json());
    }
    else if(!_.isUndefined(this.collection)) {
      // Build HTML string from collection
      var ret = '';
      var that = this;
      this.collection.each(function(model) {
        ret += _.template(that.$template, model.json());
      });
      return ret;
    }
  }

  // Build HTML string from JSON
  return _.template(this.$template, json);
}

/**
 * Standard render method that should be called upon enabled.
 * This functionality can be overridden.
 *
 * Do note that, the render() method is NOT registered as a
 * trigger when the view is enabled, or model is fetched. YOU
 * HAVE TO DO IT YOURSELF! These 'linking' triggers should be
 * handled by a Controller.
 */
Cjs._View.render = function() {
  this._render();
};

/**
 * Default render method for convenience.
 * Checks if the view is enabled before rendering.
 * Triggers:
 * - renderBefore: view
 * - renderAfter: view
 */
Cjs._View._render = function() {
  if(!this.isEnabled())
    return;

  // Ensure element is defined
  if(_.isUndefined(this.element)) {
    Cjs._log('Cjs.View', 'Undefined element found.');
    return;
  }

  // Retrieve the uncached object if necessary
  if(this._uncached) {
    this.$element = $(this.element);

    // Ensure jQuery object exists
    if(this.$element.length === 0) {
      Cjs._log('Cjs.View', 'Undefined element found.');
      return;
    }
  }

  Cjs._log('Cjs.View', 'Default render used.');

  // Replace HTML string
  this.trigger('renderBefore', this);
  this.$element.html(this.build());
  this.trigger('renderAfter', this);
};

/**
 * Checks if the view is enabled.
 * @return True if enabled. Otherwise, false.
 */
Cjs._View.isEnabled = function() {
  return this._isEnabled;
};

/**
 * Enables or disables the view.
 * On enable:
 * - Register DOM events.
 * On disable:
 * - Unregister DOM events.
 * Triggers:
 * - enabled: view
 * - disabled: view
 */
Cjs._View.setEnabled = function(enabled) {
  if(!_.isBoolean(enabled)) {
    Cjs._log('Cjs.View', 'Invalid parameter - enabled, boolean expected.');
    return;
  }

  // Don't do twice
  if(this._isEnabled === enabled)
    return;

  // Enable
  this._isEnabled = enabled;
  if(this._isEnabled) {
    this._registerDomEvents();
    this.trigger('enabled', this);
  }

  // Disable
  else {
    this._unregisterDomEvents();
    this.trigger('disabled', this);
  }
};

/**
 * This is the shorthand version of jQuery's on() function.
 * @param event DOM event name.
 * @param selector DOM selector. Pass an empty string if none.
 * @param func Subscriber function to callback to. Can be a function name to this object.
 */
Cjs._View.on = function(event, selector, func) {
  if(!_.isString(event)) {
    Cjs._log('Cjs.View', 'Invalid parameter - event, string expected.');
    return;
  }

  if(!_.isString(selector)) {
    Cjs._log('Cjs.View', 'Invalid parameter - selector, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    // Bind to object
    func = this[func];
    if(_.isFunction(func))
      func = _.bind(func, this);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.View', 'Invalid parameter - func, function expected.');
    return;
  }

  // Pass to jQuery
  if(selector === '')
    selector = undefined;
  this.$element.on(event, selector, func);
};

/**
 * This is the shorthand version of jQuery's off() function.
 * @param event DOM event name.
 * @param selector DOM selector. Pass an empty string if none.
 * @param func Subscriber function to callback to. Can be a function name to this object.
 */
Cjs._View.off = function(event, selector, func) {
  if(!_.isString(event)) {
    Cjs._log('Cjs.View', 'Invalid parameter - event, string expected.');
    return;
  }

  if(!_.isString(selector)) {
    Cjs._log('Cjs.View', 'Invalid parameter - selector, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    // Bind to object
    func = this[func];
    if(_.isFunction(func))
      func = _.bind(func, this);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.View', 'Invalid parameter - func, function expected.');
    return;
  }

  // Pass to jQuery
  if(selector === '')
    selector = undefined;
  this.$element.off(event, selector, func);
};

/**
 * Registers all DOM events in dom object. This allows users to
 * easily register/unregister events without manually specifying
 * each one.
 * @see setEnabled()
 */
Cjs._View._registerDomEvents = function() {
  if(this._isRegisteredDomEvents)
    return;

  this._isRegisteredDomEvents = true;
  var that = this;

  _.each(this.dom, function(value, key) {
    // Tokenize based on whitespaces
    var match = key.match(/^(\S+)\s*(.*)$/);
    if(!_.isNull(match))
      that.on(match[1], match[2], value);
  });
};

/**
 * Unregisters all DOM events in dom object. This allows users to
 * easily register/unregister events without manually specifying
 * each one.
 * @see setEnabled()
 */
Cjs._View._unregisterDomEvents = function() {
  if(!this._isRegisteredDomEvents)
    return;

  this._isRegisteredDomEvents = false;
  var that = this;

  _.each(this.dom, function(value, key) {
    // Tokenize based on whitespaces
    var match = key.match(/^(\S+)\s*(.*)$/);
    if(!_.isNull(match))
      that.off(match[1], match[2], value);
  });
};

/**
 * Public constructor.
 * @param properties Extended properties for this instance.
 */
Cjs.View = function(properties) {
  // Extended properties
  if(!_.isUndefined(properties)) {
    var that = this;
    _.each(properties, function(value, key) {
      that[key] = value;
    });
  }

  this._isEnabled = false;
  this._isRegisteredDomEvents = false;
  this._uncached = true;

  if(this.element) {
    // Create jQuery reference
    this.$element = $(this.element);
    this._uncached = (this.$element.length === 0);
  }
  else {
    Cjs._log('Cjs.View', 'Undefined element found.');
  }

  if(this.template) {
    // Retrieve template from file
    var that = this;
    var request = $.ajax({
      url: this.template,
      type: 'GET',
      dataType: 'html',
      async: false
    });

    // try
    request.done(function(response, status, jqXHR) {
      that.$template = response;
    });

    // catch
    request.fail(function(jqXHR, status, error) {
      Cjs._log('Cjs.View', 'Cannot retrieve template URL "' + that.template + '".');
      that.$template = '';
    });
  }
  else {
    Cjs._log('Cjs.View', 'Undefined template found.');
  }

  // Ignore first argument
  Cjs._shift.apply(arguments);
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.View.prototype, Cjs._View, Cjs._Event);
Cjs.View.extend = Cjs._extend;
