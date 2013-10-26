
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

/**
 * Event.
 * Handles events using the publisher-subscriber design pattern.
 * "Inherited" by all Cjs prototypes.
 */
Cjs._Event = function() {};

/**
 * Triggers an event with a specific name and
 * passes its arguments to all subscribers.
 * @param name Event name.
 * @param args Event arguments.
 */
Cjs._Event.trigger = function(name, args) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Ignore if does not exist
  if(!this._events)
    return;
  if(!this._events[name])
    return;

  Cjs._log('Cjs.Event', 'Triggered an event "' + name + '".');

  // Trigger all subscribers
  var event = this._events[name];
  for(var i=0; i<event.length; ++i) {
    event[i].func(args);
  }
};

/**
 * Subscribes a function to trigger when event with a specific name
 * is triggered. The subscriber function can be a string, which would
 * then be assumed to be a function binded to the subscriber object.
 * @param name Event name.
 * @param func Subscriber function.
 * @param obj Subscriber object to bind to.
 */
Cjs._Event.subscribe = function(name, func, obj) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    if(_.isUndefined(obj)) {
      Cjs._log('Cjs.Event', 'Invalid parameter - obj, object expected.');
      return;
    }

    // Bind to object
    func = obj[func];
    if(_.isFunction(func))
      func = _.bind(func, obj);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - func, function expected.');
    return;
  }

  Cjs._log('Cjs.Event', 'Subscribed to "' + name + '".');

  // Create if does not exist
  if(!this._events)
    this._events = {};
  if(!this._events[name])
    this._events[name] = [];

  // Add subscription to event
  this._events[name].push({func: func});
};

/**
 * Unsubscribes a function with a specific name. The subscriber
 * function can be a string, which would then be assumed to be
 * a function binded to the subscriber object.
 * @param name Event name.
 * @param func Subscriber function.
 * @param obj Subscriber object to bind to.
 */
Cjs._Event.unsubscribe = function(name, func, obj) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    if(_.isUndefined(obj)) {
      Cjs._log('Cjs.Event', 'Invalid parameter - obj, object expected.');
      return;
    }

    // Bind to object
    func = obj[func];
    if(_.isFunction(func))
      func = _.bind(func, obj);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - func, function expected.');
    return;
  }

  if(!this._events)
    return;
  if(!this._events[name])
    return;

  Cjs._log('Cjs.Event', 'Unsubscribed to "' + name + '".');

  // Find and remove all instances of the subscriber
  var event = this._events[name];
  for(var i=0; i<event.length; ++i) {
    if(event[i].func == func)
      event.splice(i--, 1);
  }
};

/**
 * Router.
 * Matches hashbangs and routes it to the correct subscriber.
 *
 * There is a global Router called, Cjs.Router.
 * Use Cjs.RouterEx prototype to extend.
 */
Cjs._RouterEx = function() {};

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._RouterEx.init = function(args) {
};

/**
 * Registers a hashbang route (e.g. #hash) matching the hash to subscriber. There are
 * a few conventions that allow easy matching. Because routes are generally of the type
 * "hash/awesome/new", all hashbangs passed to this function will be split up via '/' into
 * tokens.
 *
 * Each token can begin with "$", "?$" or "*" to represent special things:
 * - "$" represents a variable, that token will be substituted by the hashbang.
 * - "?$" represents an optional variable, that token may or may not exist in the match.
 * - "*" represents a wildcard path for that token.
 *
 * The subscriber function can be a string, which would then be assumed to be a function
 * binded to this object. The subscriber function should accept:
 * - hash: The original hashbang string.
 * - params: A Javascript object containing key-value-pairs of the variables.
 *   E.g. "hash/$id/*new" => "hash/19/img/1.png" => params: {"id": 19, "new": "img/1.png"}
 * - 0...* args: In-ordered version of the above.
 *
 * @param hash Hashbang route.
 * @param func Subscriber function.
 * @param obj Subscriber object to bind to.
 */
Cjs._RouterEx.register = function(hash, func, obj) {
  if(!_.isString(hash)) {
    Cjs._log('Cjs.Router', 'Invalid parameter - hash, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    if(_.isUndefined(obj)) {
      Cjs._log('Cjs.Router', 'Invalid parameter - obj, object expected.');
      return;
    }

    // Bind to object
    func = obj[func];
    if(_.isFunction(func))
      func = _.bind(func, obj);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Router', 'Invalid parameter - func, function expected.');
    return;
  }

  Cjs._log('Cjs.Router', 'Registering route "' + hash + '".');
  if(!this._routes)
    this._routes = [];

  // Keep extra information about this route
  // This is done so that we can parse the arguments properly
  var regex = hash;
  var args = [];

  if(regex !== '') {
    // Tokenizes hash and converts to regular expressions
    var tkns = regex.split('/');
    if(!_.isNull(tkns)) {
      regex = '';
      for(var i=0; i<tkns.length; ++i) {
        var tkn = tkns[i];

        // Wildcard path
        if(tkn[0] === '*') {
          regex += '?([\\w-\\.~/]+)/';
          args.push({
            tkn: tkn.substring(1, tkn.length),
            index: i+1
          });
        }

        // Optional variable
        else if(tkn[0] === '?' && tkn[1] === '$') {
          regex += '?(\\w+)?/';
          args.push({
            tkn: tkn.substring(2, tkn.length),
            index: i+1
          });
        }

        // Variable
        else if(tkn[0] === '$') {
          regex += '(\\w+)/';
          args.push({
            tkn: tkn.substring(1, tkn.length),
            index: i+1
          });
        }

        // Name
        else {
          regex += '(' + tkn + ')/';
        }
      }
      
      // Makes the last forward slash optional
      if(regex[regex.length-1] === '/')
        regex += '?';
    }
  }

  this._routes.push({hash: hash, regex: regex, args: args, func: func});
};

/**
 * Starts the router. This will register for the hash-change
 * event and kickoff with an initial hash change check. The
 * subscriber is always fired before the trigger.
 * Triggers:
 * - route: hash, params, args
 */
Cjs._RouterEx.start = function() {
  if(!this._routes) {
    Cjs._log('Cjs.Router', 'No routes registered.');
    return;
  }

  // Bind to hash change event
  _.bindAll(this, '_hashChange');
  $(window).on('hashchange', this._hashChange);

  // Kickoff with initial hash change event
  this._hashChange();
};

/**
 * Changes the hashbang url.
 */
Cjs._RouterEx.navigate = function(hash) {
  window.location.hash = '#' + hash;
};

/**
 * Internal hash change event handler. Detects the hash
 * change and fires the appropriate subscriber. The
 * subscriber is always fired before the trigger.
 * Triggers:
 * - route: hash, params, args
 */
Cjs._RouterEx._hashChange = function() {
  var hash = window.location.href.match('#(.*)$');
  hash = hash ? hash[1] : '';

  var done = false;
  for(var i=0; i<this._routes.length; ++i) {
    var route = this._routes[i];

    // Default route
    if(route.hash === '') {
      if(hash === '') {
        route.func(route.hash);
        this.trigger('route', route.hash);
        done = true;
        break;
      }
      continue;
    }

    // Try to match the hash with this route...
    var match = hash.match(route.regex);
    if(!_.isNull(match)) {
      var params = {};
      var args = [];

      // Convert hashtags into parameters and arguments
      for(var i=0; i<route.args.length; ++i) {
        var arg = route.args[i];
        params[arg.tkn] = match[arg.index];
        args[i] = match[arg.index];
      }

      // Perform callback
      route.func(route.hash, params, args);
      this.trigger('route', route.hash, params, args);
      done = true;
      break;
    }
  }

  // Warn if no routes available
  if(!done)
    Cjs._log('Cjs.Router', 'No routes available.');
};

/**
 * Public constructor.
 */
Cjs.RouterEx = function() {
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.RouterEx.prototype, Cjs._RouterEx, Cjs._Event);
Cjs.RouterEx.extend = Cjs._extend;

// Global router
Cjs.Router = new Cjs.RouterEx();

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

/**
 * Model.
 * Represents a single row in the database table.
 */
Cjs._Model = function() {};

/**
 * Default values will be automatically set
 * upon object creation or when reset() is called.
 */
Cjs._Model.defaults = {};

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._Model.init = function() {
};

/**
 * Fetches the model data at the specified URL using a GET request.
 * Triggers:
 * - fetchSuccess: model
 * - fetchFailure: model, textStatus, errorThrown
 * @param url The url address to fetch the model data at.
 */
Cjs._Model.fetch = function(url) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Fetching model @ "' + url + '".');

  // GET request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    // Overwrite the existing model
    that.reset();
    that.set(response);
    that.trigger('fetchSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('fetchFailure', that, status, error);
  });
};

/**
 * Creates the model data at the specified URL using a POST request.
 * Triggers:
 * - createSuccess: model
 * - createFailure: model, textStatus, errorThrown
 * @param url The url address to create the model data at.
 * @param json JSON data. If none specified, uses the model by default.
 */
Cjs._Model.create = function(url, json) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Creating model @ "' + url + '".');

  // Replace with model if no JSON data found
  if(_.isUndefined(json))
    json = this.json();

  // POST request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    data: json,
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('createSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('createFailure', that, status, error);
  });
};

/**
 * Updates the model data at the specified URL using a PUT request.
 * Triggers:
 * - updateSuccess: model
 * - updateFailure: model, textStatus, errorThrown
 * @param url The url address to create the model data at.
 * @param json JSON data. If none specified, uses the model by default.
 */
Cjs._Model.update = function(url, json) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Updating model @ "' + url + '".');

  // Replace with model if no JSON data found
  if(_.isUndefined(json))
    json = this.json();

  // PUT request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'PUT',
    dataType: 'json',
    data: json,
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('updateSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('updateFailure', that, status, error);
  });
};

/**
 * Destroys the model data at the specified URL using a DELETE request.
 * Triggers:
 * - destroySuccess: model
 * - destroyFailure: model, textStatus, errorThrown
 * @param url The url address to destroy the model data at.
 */
Cjs._Model.destroy = function(url) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Destroying model @ "' + url + '".');

  // DELETE request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'DELETE',
    dataType: 'json',
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('destroySuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('destroyFailure', that, status, error);
  });
};

/**
 * Retrieves an attribute value from the model.
 * @param key A string literal acting as attribute key.
 * @return Attribute value.
 */
Cjs._Model.get = function(key) {
  if(!_.isString(key)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - key, string expected.');
    return undefined;
  }
  return this.attributes[key];
};

/**
 * Adds the attributes to the model. When there is a
 * duplicate key, new keys will overwrite old keys.
 * Triggers:
 * - changed: model, attributes
 * @param attributes A JavaScript object containing key-value pairs.
 */
Cjs._Model.set = function(attributes) {
  var that = this;
  _.each(attributes, function(value, key) {
    that.attributes[key] = value;
  });
  this.trigger('changed', this, attributes);
};

/**
 * Clears the model attributes and sets it to its defaults.
 * Triggers:
 * - reset: model
 * - changed: model, defaults
 */
Cjs._Model.reset = function() {
  this.attributes = {};
  this.trigger('reset', this);
  this.set(this.defaults);
};

/**
 * Converts the model into a JSON object.
 */
Cjs._Model.json = function() {
  return this.attributes;
};

/**
 * Converts the model into a JSON string.
 * This is equivalent to JSON.stringify(json()).
 */
Cjs._Model.stringify = function() {
  return JSON.stringify(this.json());
};

/**
 * Public constructor.
 * @param properties Extended properties for this instance.
 * @param attributes Adds to attributes. Equivalent to calling set(attributes) after construction.
 */
Cjs.Model = function(properties, attributes) {
  // Extended properties
  if(!_.isUndefined(properties)) {
    var that = this;
    _.each(properties, function(value, key) {
      that[key] = value;
    });
  }

  this.reset();
  if(!_.isUndefined(attributes))
    this.set(attributes);

  // Ignore first two arguments
  Cjs._shift.apply(arguments);
  Cjs._shift.apply(arguments);
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.Model.prototype, Cjs._Model, Cjs._Event);
Cjs.Model.extend = Cjs._extend;

/**
 * Collection.
 * Represents a table in a database.
 * Stores all models in a list.
 * Provide convenient functions for them.
 */
Cjs._Collection = function() {};

/**
 * The model object that is to be used with this collection.
 * Derived classes should override this parameter to use
 * their own custom model.
 */
Cjs._Collection.model = Cjs.Model;

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._Collection.init = function(args) {
};

/**
 * Fetches the collection data at the specified URL using a GET request.
 * Triggers:
 * - added: collection, model
 * - fetchSuccess: collection
 * - fetchFailure: collection, textStatus, errorThrown
 * @param url The url address to fetch the model data from.
 */
Cjs._Collection.fetch = function(url) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Collection', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Collection', 'Fetching from "' + url + '".');

  var that = this;
  var request = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    async: true
  });
  
  // try
  request.done(function(response, status, jqXHR) {
    // Create and copy each model object individually
    // This is done so that client code can iterate
    // and retrieve each model in the collection.
    that.models = [];
    for(var i=0; i<response.length; ++i) {
      var obj = new that.model();
      obj.set(response[i]);
      that.add(obj);
    }
    that.trigger('fetchSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('fetchFailure', that, status, error);
  });
};

/**
 * Adds a model to the collection.
 * Triggers:
 * - added: collection, model
 * @param model Model to add to the collection
 */
Cjs._Collection.add = function(model) {
  this.models.push(model);
  this.trigger('added', this, model);
};

/**
 * Adds all models in array to the collection.
 * Triggers:
 * - added: collection, model
 * @param models Models to add to the collection
 */
Cjs._Collection.addAll = function(models) {
  if(!_.isArray(models)) {
    Cjs._log('Cjs.Collection', 'Invalid parameter - models, array expected.');
    return;
  }

  // Iterate and add one-by-one
  var that = this;
  _.each(models, function(model) {
    that.add(model);
  });
};

/**
 * Removes a model from the collection. This function will match all
 * models that is equal in the collection and remove them.
 * Triggers:
 * - removed: collection, model
 * @param model Model to remove from the collection
 */
Cjs._Collection.remove = function(model) {
  // Find and remove all instances of the model
  for(var i=0; i<this.models.length; ++i) {
    if(this.models[i] == model) {
      this.models.splice(i--, 1);
      this.trigger('removed', this, model);
    }
  }
};

/**
 * Iterates through the collection calling back
 * the specified function. This is a shorthand version
 * of Underscore.js's _.each() functionality.
 * @param func Function to callback.
 */
Cjs._Collection.each = function(func) {
  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Collection', 'Invalid parameter - func, function expected.');
    return;
  }

  _.each(this.models, func);
};

/**
 * Clears the colllection.
 * Triggers:
 * - reset: collection
 */
Cjs._Collection.reset = function() {
  this.models = [];
  this.trigger('reset', this);
};

/**
 * Converts the collection into a JSON object.
 */
Cjs._Collection.json = function() {
  // Convert to JSON array object using
  // the model's JSON functionality.
  var json = [];
  _.each(this.models, function(model) {
    json.push(model.json());
  });
  return json;
};

/**
 * Converts the collection into a JSON string.
 * This is equivalent to JSON.stringify(json()).
 */
Cjs._Collection.stringify = function() {
  return JSON.stringify(this.json());
};

/**
 * Public constructor.
 * @param properties Extended properties for this instance.
 * @param models Adds to models. Equivalent to calling addAll(models) after construction.
 */
Cjs.Collection = function(properties, models) {
  // Extended properties
  if(!_.isUndefined(properties)) {
    var that = this;
    _.each(properties, function(value, key) {
      that[key] = value;
    });
  }

  this.reset();
  if(!_.isUndefined(models))
    this.addAll(models);

  // Ignore first two arguments
  Cjs._shift.apply(arguments);
  Cjs._shift.apply(arguments);
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.Collection.prototype, Cjs._Collection, Cjs._Event);
Cjs.Collection.extend = Cjs._extend;

/**
 * View.
 * Renders HTML based on a given template.
 * Has events to respond to DOM callbacks.
 */
Cjs._View = function() {};

/**
 * HTML element identifier. jQuery is used to formulate a
 * $element based on this at object construction.
 */
Cjs._View.element = undefined;

/**
 * HTML template url using Underscore.js templating system.
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
 * Standard render method that should be called upon render.
 * This functionality can be overridden.
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

  if(_.isUndefined(this.element)) {
    Cjs._log('Cjs.View', 'Undefined element found.');
    return;
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

  if(this.element) {
    // Create jQuery reference
    this.$element = $(this.element);
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
      Cjs._log('Cjs.View', 'Cannot retrieve template url "' + that.template + '".');
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

/**
 * Event.
 * Handles events using the publisher-subscriber design pattern.
 * "Inherited" by all Cjs prototypes.
 */
Cjs._Event = function() {};

/**
 * Triggers an event with a specific name and
 * passes its arguments to all subscribers.
 * @param name Event name.
 * @param args Event arguments.
 */
Cjs._Event.trigger = function(name, args) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Ignore if does not exist
  if(!this._events)
    return;
  if(!this._events[name])
    return;

  Cjs._log('Cjs.Event', 'Triggered an event "' + name + '".');

  // Trigger all subscribers
  var event = this._events[name];
  for(var i=0; i<event.length; ++i) {
    event[i].func(args);
  }
};

/**
 * Subscribes a function to trigger when event with a specific name
 * is triggered. The subscriber function can be a string, which would
 * then be assumed to be a function binded to the subscriber object.
 * @param name Event name.
 * @param func Subscriber function.
 * @param obj Subscriber object to bind to.
 */
Cjs._Event.subscribe = function(name, func, obj) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    if(_.isUndefined(obj)) {
      Cjs._log('Cjs.Event', 'Invalid parameter - obj, object expected.');
      return;
    }

    // Bind to object
    func = obj[func];
    if(_.isFunction(func))
      func = _.bind(func, obj);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - func, function expected.');
    return;
  }

  Cjs._log('Cjs.Event', 'Subscribed to "' + name + '".');

  // Create if does not exist
  if(!this._events)
    this._events = {};
  if(!this._events[name])
    this._events[name] = [];

  // Add subscription to event
  this._events[name].push({func: func});
};

/**
 * Unsubscribes a function with a specific name. The subscriber
 * function can be a string, which would then be assumed to be
 * a function binded to the subscriber object.
 * @param name Event name.
 * @param func Subscriber function.
 * @param obj Subscriber object to bind to.
 */
Cjs._Event.unsubscribe = function(name, func, obj) {
  if(!_.isString(name)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - name, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    if(_.isUndefined(obj)) {
      Cjs._log('Cjs.Event', 'Invalid parameter - obj, object expected.');
      return;
    }

    // Bind to object
    func = obj[func];
    if(_.isFunction(func))
      func = _.bind(func, obj);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Event', 'Invalid parameter - func, function expected.');
    return;
  }

  if(!this._events)
    return;
  if(!this._events[name])
    return;

  Cjs._log('Cjs.Event', 'Unsubscribed to "' + name + '".');

  // Find and remove all instances of the subscriber
  var event = this._events[name];
  for(var i=0; i<event.length; ++i) {
    if(event[i].func == func)
      event.splice(i--, 1);
  }
};

/**
 * Model.
 * Represents a single row in the database table.
 */
Cjs._Model = function() {};

/**
 * Default values will be automatically set
 * upon object creation or when reset() is called.
 */
Cjs._Model.defaults = {};

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._Model.init = function() {
};

/**
 * Fetches the model data at the specified URL using a GET request.
 * Triggers:
 * - fetchSuccess: model
 * - fetchFailure: model, textStatus, errorThrown
 * @param url The url address to fetch the model data at.
 */
Cjs._Model.fetch = function(url) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Fetching model @ "' + url + '".');

  // GET request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    // Overwrite the existing model
    that.reset();
    that.set(response);
    that.trigger('fetchSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('fetchFailure', that, status, error);
  });
};

/**
 * Creates the model data at the specified URL using a POST request.
 * Triggers:
 * - createSuccess: model
 * - createFailure: model, textStatus, errorThrown
 * @param url The url address to create the model data at.
 * @param json JSON data. If none specified, uses the model by default.
 */
Cjs._Model.create = function(url, json) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Creating model @ "' + url + '".');

  // Replace with model if no JSON data found
  if(_.isUndefined(json))
    json = this.json();

  // POST request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'POST',
    dataType: 'json',
    data: json,
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('createSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('createFailure', that, status, error);
  });
};

/**
 * Updates the model data at the specified URL using a PUT request.
 * Triggers:
 * - updateSuccess: model
 * - updateFailure: model, textStatus, errorThrown
 * @param url The url address to create the model data at.
 * @param json JSON data. If none specified, uses the model by default.
 */
Cjs._Model.update = function(url, json) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Updating model @ "' + url + '".');

  // Replace with model if no JSON data found
  if(_.isUndefined(json))
    json = this.json();

  // PUT request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'PUT',
    dataType: 'json',
    data: json,
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('updateSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('updateFailure', that, status, error);
  });
};

/**
 * Destroys the model data at the specified URL using a DELETE request.
 * Triggers:
 * - destroySuccess: model
 * - destroyFailure: model, textStatus, errorThrown
 * @param url The url address to destroy the model data at.
 */
Cjs._Model.destroy = function(url) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Model', 'Destroying model @ "' + url + '".');

  // DELETE request
  var that = this;
  var request = $.ajax({
    url: url,
    type: 'DELETE',
    dataType: 'json',
    async: true
  });

  // try
  request.done(function(response, status, jqXHR) {
    that.trigger('destroySuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('destroyFailure', that, status, error);
  });
};

/**
 * Retrieves an attribute value from the model.
 * @param key A string literal acting as attribute key.
 * @return Attribute value.
 */
Cjs._Model.get = function(key) {
  if(!_.isString(key)) {
    Cjs._log('Cjs.Model', 'Invalid parameter - key, string expected.');
    return undefined;
  }
  return this.attributes[key];
};

/**
 * Adds the attributes to the model. When there is a
 * duplicate key, new keys will overwrite old keys.
 * Triggers:
 * - changed: model, attributes
 * @param attributes A JavaScript object containing key-value pairs.
 */
Cjs._Model.set = function(attributes) {
  var that = this;
  _.each(attributes, function(value, key) {
    that.attributes[key] = value;
  });
  this.trigger('changed', this, attributes);
};

/**
 * Clears the model attributes and sets it to its defaults.
 * Triggers:
 * - reset: model
 * - changed: model, defaults
 */
Cjs._Model.reset = function() {
  this.attributes = {};
  this.trigger('reset', this);
  this.set(this.defaults);
};

/**
 * Converts the model into a JSON object.
 */
Cjs._Model.json = function() {
  return this.attributes;
};

/**
 * Converts the model into a JSON string.
 * This is equivalent to JSON.stringify(json()).
 */
Cjs._Model.stringify = function() {
  return JSON.stringify(this.json());
};

/**
 * Public constructor.
 * @param properties Extended properties for this instance.
 * @param attributes Adds to attributes. Equivalent to calling set(attributes) after construction.
 */
Cjs.Model = function(properties, attributes) {
  // Extended properties
  if(!_.isUndefined(properties)) {
    var that = this;
    _.each(properties, function(value, key) {
      that[key] = value;
    });
  }

  this.reset();
  if(!_.isUndefined(attributes))
    this.set(attributes);

  // Ignore first two arguments
  Cjs._shift.apply(arguments);
  Cjs._shift.apply(arguments);
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.Model.prototype, Cjs._Model, Cjs._Event);
Cjs.Model.extend = Cjs._extend;

/**
 * Collection.
 * Represents a table in a database.
 * Stores all models in a list.
 * Provide convenient functions for them.
 */
Cjs._Collection = function() {};

/**
 * The model object that is to be used with this collection.
 * Derived classes should override this parameter to use
 * their own custom model.
 */
Cjs._Collection.model = Cjs.Model;

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._Collection.init = function(args) {
};

/**
 * Fetches the collection data at the specified URL using a GET request.
 * Triggers:
 * - added: collection, model
 * - fetchSuccess: collection
 * - fetchFailure: collection, textStatus, errorThrown
 * @param url The url address to fetch the model data from.
 */
Cjs._Collection.fetch = function(url) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Collection', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Collection', 'Fetching from "' + url + '".');

  var that = this;
  var request = $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    async: true
  });
  
  // try
  request.done(function(response, status, jqXHR) {
    // Create and copy each model object individually
    // This is done so that client code can iterate
    // and retrieve each model in the collection.
    that.models = [];
    for(var i=0; i<response.length; ++i) {
      var obj = new that.model();
      obj.set(response[i]);
      that.add(obj);
    }
    that.trigger('fetchSuccess', that);
  });

  // catch
  request.fail(function(jqXHR, status, error) {
    that.trigger('fetchFailure', that, status, error);
  });
};

/**
 * Adds a model to the collection.
 * Triggers:
 * - added: collection, model
 * @param model Model to add to the collection
 */
Cjs._Collection.add = function(model) {
  this.models.push(model);
  this.trigger('added', this, model);
};

/**
 * Adds all models in array to the collection.
 * Triggers:
 * - added: collection, model
 * @param models Models to add to the collection
 */
Cjs._Collection.addAll = function(models) {
  if(!_.isArray(models)) {
    Cjs._log('Cjs.Collection', 'Invalid parameter - models, array expected.');
    return;
  }

  // Iterate and add one-by-one
  var that = this;
  _.each(models, function(model) {
    that.add(model);
  });
};

/**
 * Removes a model from the collection. This function will match all
 * models that is equal in the collection and remove them.
 * Triggers:
 * - removed: collection, model
 * @param model Model to remove from the collection
 */
Cjs._Collection.remove = function(model) {
  // Find and remove all instances of the model
  for(var i=0; i<this.models.length; ++i) {
    if(this.models[i] == model) {
      this.models.splice(i--, 1);
      this.trigger('removed', this, model);
    }
  }
};

/**
 * Iterates through the collection calling back
 * the specified function. This is a shorthand version
 * of Underscore.js's _.each() functionality.
 * @param func Function to callback.
 */
Cjs._Collection.each = function(func) {
  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Collection', 'Invalid parameter - func, function expected.');
    return;
  }

  _.each(this.models, func);
};

/**
 * Clears the colllection.
 * Triggers:
 * - reset: collection
 */
Cjs._Collection.reset = function() {
  this.models = [];
  this.trigger('reset', this);
};

/**
 * Converts the collection into a JSON object.
 */
Cjs._Collection.json = function() {
  // Convert to JSON array object using
  // the model's JSON functionality.
  var json = [];
  _.each(this.models, function(model) {
    json.push(model.json());
  });
  return json;
};

/**
 * Converts the collection into a JSON string.
 * This is equivalent to JSON.stringify(json()).
 */
Cjs._Collection.stringify = function() {
  return JSON.stringify(this.json());
};

/**
 * Public constructor.
 * @param properties Extended properties for this instance.
 * @param models Adds to models. Equivalent to calling addAll(models) after construction.
 */
Cjs.Collection = function(properties, models) {
  // Extended properties
  if(!_.isUndefined(properties)) {
    var that = this;
    _.each(properties, function(value, key) {
      that[key] = value;
    });
  }

  this.reset();
  if(!_.isUndefined(models))
    this.addAll(models);

  // Ignore first two arguments
  Cjs._shift.apply(arguments);
  Cjs._shift.apply(arguments);
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.Collection.prototype, Cjs._Collection, Cjs._Event);
Cjs.Collection.extend = Cjs._extend;

/**
 * View.
 * Renders HTML based on a given template.
 * Has events to respond to DOM callbacks.
 */
Cjs._View = function() {};

/**
 * HTML element identifier. jQuery is used to formulate a
 * $element based on this at object construction.
 */
Cjs._View.element = undefined;

/**
 * HTML template url using Underscore.js templating system.
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
 * Standard render method that should be called upon render.
 * This functionality can be overridden.
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

  if(_.isUndefined(this.element)) {
    Cjs._log('Cjs.View', 'Undefined element found.');
    return;
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

  if(this.element) {
    // Create jQuery reference
    this.$element = $(this.element);
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
      Cjs._log('Cjs.View', 'Cannot retrieve template url "' + that.template + '".');
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

/**
 * Router.
 * Matches hashbangs and routes it to the correct subscriber.
 *
 * There is a global Router called, Cjs.Router.
 * Use Cjs.RouterEx prototype to extend.
 */
Cjs._RouterEx = function() {};

/**
 * Initialize method that is called upon construction.
 * This functionality can be overridden.
 */
Cjs._RouterEx.init = function(args) {
};

/**
 * Registers a hashbang route (e.g. #hash) matching the hash to subscriber. There are
 * a few conventions that allow easy matching. Because routes are generally of the type
 * "hash/awesome/new", all hashbangs passed to this function will be split up via '/' into
 * tokens.
 *
 * Each token can begin with "$", "?$" or "*" to represent special things:
 * - "$" represents a variable, that token will be substituted by the hashbang.
 * - "?$" represents an optional variable, that token may or may not exist in the match.
 * - "*" represents a wildcard path for that token.
 *
 * The subscriber function can be a string, which would then be assumed to be a function
 * binded to this object. The subscriber function should accept:
 * - hash: The original hashbang string.
 * - params: A Javascript object containing key-value-pairs of the variables.
 *   E.g. "hash/$id/*new" => "hash/19/img/1.png" => params: {"id": 19, "new": "img/1.png"}
 * - 0...* args: In-ordered version of the above.
 *
 * @param hash Hashbang route.
 * @param func Subscriber function.
 * @param obj Subscriber object to bind to.
 */
Cjs._RouterEx.register = function(hash, func, obj) {
  if(!_.isString(hash)) {
    Cjs._log('Cjs.Router', 'Invalid parameter - hash, string expected.');
    return;
  }

  // Convert string to function
  if(_.isString(func)) {
    if(_.isUndefined(obj)) {
      Cjs._log('Cjs.Router', 'Invalid parameter - obj, object expected.');
      return;
    }

    // Bind to object
    func = obj[func];
    if(_.isFunction(func))
      func = _.bind(func, obj);
  }

  if(!_.isFunction(func)) {
    Cjs._log('Cjs.Router', 'Invalid parameter - func, function expected.');
    return;
  }

  Cjs._log('Cjs.Router', 'Registering route "' + hash + '".');
  if(!this._routes)
    this._routes = [];

  // Keep extra information about this route
  // This is done so that we can parse the arguments properly
  var regex = hash;
  var args = [];

  if(regex !== '') {
    // Tokenizes hash and converts to regular expressions
    var tkns = regex.split('/');
    if(!_.isNull(tkns)) {
      regex = '';
      for(var i=0; i<tkns.length; ++i) {
        var tkn = tkns[i];

        // Wildcard path
        if(tkn[0] === '*') {
          regex += '?([\\w-\\.~/]+)/';
          args.push({
            tkn: tkn.substring(1, tkn.length),
            index: i+1
          });
        }

        // Optional variable
        else if(tkn[0] === '?' && tkn[1] === '$') {
          regex += '?(\\w+)?/';
          args.push({
            tkn: tkn.substring(2, tkn.length),
            index: i+1
          });
        }

        // Variable
        else if(tkn[0] === '$') {
          regex += '(\\w+)/';
          args.push({
            tkn: tkn.substring(1, tkn.length),
            index: i+1
          });
        }

        // Name
        else {
          regex += '(' + tkn + ')/';
        }
      }
      
      // Makes the last forward slash optional
      if(regex[regex.length-1] === '/')
        regex += '?';
    }
  }

  this._routes.push({hash: hash, regex: regex, args: args, func: func});
};

/**
 * Starts the router. This will register for the hash-change
 * event and kickoff with an initial hash change check. The
 * subscriber is always fired before the trigger.
 * Triggers:
 * - route: hash, params, args
 */
Cjs._RouterEx.start = function() {
  if(!this._routes) {
    Cjs._log('Cjs.Router', 'No routes registered.');
    return;
  }

  // Bind to hash change event
  _.bindAll(this, '_hashChange');
  $(window).on('hashchange', this._hashChange);

  // Kickoff with initial hash change event
  this._hashChange();
};

/**
 * Changes the hashbang url.
 */
Cjs._RouterEx.navigate = function(hash) {
  window.location.hash = '#' + hash;
};

/**
 * Internal hash change event handler. Detects the hash
 * change and fires the appropriate subscriber. The
 * subscriber is always fired before the trigger.
 * Triggers:
 * - route: hash, params, args
 */
Cjs._RouterEx._hashChange = function() {
  var hash = window.location.href.match('#(.*)$');
  hash = hash ? hash[1] : '';

  var done = false;
  for(var i=0; i<this._routes.length; ++i) {
    var route = this._routes[i];

    // Default route
    if(route.hash === '') {
      if(hash === '') {
        route.func(route.hash);
        this.trigger('route', route.hash);
        done = true;
        break;
      }
      continue;
    }

    // Try to match the hash with this route...
    var match = hash.match(route.regex);
    if(!_.isNull(match)) {
      var params = {};
      var args = [];

      // Convert hashtags into parameters and arguments
      for(var i=0; i<route.args.length; ++i) {
        var arg = route.args[i];
        params[arg.tkn] = match[arg.index];
        args[i] = match[arg.index];
      }

      // Perform callback
      route.func(route.hash, params, args);
      this.trigger('route', route.hash, params, args);
      done = true;
      break;
    }
  }

  // Warn if no routes available
  if(!done)
    Cjs._log('Cjs.Router', 'No routes available.');
};

/**
 * Public constructor.
 */
Cjs.RouterEx = function() {
  this.init.apply(this, arguments);
};

// Mount implementation details
_.extend(Cjs.RouterEx.prototype, Cjs._RouterEx, Cjs._Event);
Cjs.RouterEx.extend = Cjs._extend;

// Global router
Cjs.Router = new Cjs.RouterEx();

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
