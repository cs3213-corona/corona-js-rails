
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
