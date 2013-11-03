
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
 * @param url The URL address to fetch the model data from.
 */
Cjs._Collection.fetch = function(url) {
  if(!_.isString(url)) {
    Cjs._log('Cjs.Collection', 'Invalid parameter - url, string expected.');
    return;
  }

  Cjs._log('Cjs.Collection', 'Fetching from "' + url + '".');

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
 * Retrieves the model at the specified index.
 * @return The specified model
 */
Cjs._Collection.at = function(index) {
  return this.models[index];
};

/**
 * Adds a model to the collection.
 * Triggers:
 * - added: collection, model
 * @param model Model to add to the collection
 */
Cjs._Collection.add = function(model) {
  this.models.push(model);
  this.length = this.models.length;
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
 * attributes that is equal to the models in the collection and remove them.
 * Triggers:
 * - removed: collection, model
 * @param attributes Models with matching attributes to remove
 */
Cjs._Collection.remove = function(attributes) {
  if(!_.isObject(attributes)) {
    Cjs._log('Cjs.Collection', 'Invalid parameter - attributes, object expected.');
    return;
  }

  // Iterate through to find each model to remove
  for(var i=0; i<this.models.length; ++i) {
    var model = this.models[i];
    var del = true;

    // Make sure all attributes match in model
    for(var key in attributes) {
      if(attributes[key] != model.attributes[key]) {
        del = false;
        break;
      }
    }

    // Remove model
    if(del) {
      this.models.splice(i--, 1);
      this.trigger('removed', this, model);
    }
  }
  
  // Update length
  this.length = this.models.length;
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
  this.length = 0;
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
 * @param models Adds to models. Equivalent to calling addAll(models) after construction.
 * @param properties Extended properties for this instance.
 */
Cjs.Collection = function(models, properties) {
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
