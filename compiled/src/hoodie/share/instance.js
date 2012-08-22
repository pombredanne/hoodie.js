// Generated by CoffeeScript 1.3.3
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Hoodie.Share.Instance = (function(_super) {

  __extends(Instance, _super);

  function Instance(options) {
    if (options == null) {
      options = {};
    }
    this._isMySharedObjectAndChanged = __bind(this._isMySharedObjectAndChanged, this);

    this._sync = __bind(this._sync, this);

    this._toggle = __bind(this._toggle, this);

    this._remove = __bind(this._remove, this);

    this._add = __bind(this._add, this);

    this.sync = __bind(this.sync, this);

    this.get = __bind(this.get, this);

    this.set = __bind(this.set, this);

    this.hoodie = this.constructor.hoodie;
    this.anonymous = this.hoodie.my.account.username === void 0;
    this.set(options);
    if (this.anonymous) {
      this.hoodie = new Hoodie.Share.Hoodie(this.hoodie, this);
    }
  }

  Instance.prototype._memory = {};

  Instance.prototype.set = function(key, value) {
    var _key, _ref;
    if (typeof key === 'object') {
      for (_key in key) {
        value = key[_key];
        this[_key] = this._memory[_key] = value;
      }
    } else {
      this[key] = this._memory[key] = value;
    }
    if ((_ref = this.invitees) != null ? _ref.length : void 0) {
      this["private"] = this._memory["private"] = true;
    }
    return void 0;
  };

  Instance.prototype.get = function(key) {
    return this[key];
  };

  Instance.prototype.save = function(update, options) {
    var defer, _handleUpdate,
      _this = this;
    if (update == null) {
      update = {};
    }
    defer = this.hoodie.defer();
    if (update) {
      this.set(update);
    }
    _handleUpdate = function(properties, wasCreated) {
      _this._memory = {};
      $.extend(_this, properties);
      return defer.resolve(_this);
    };
    this.hoodie.my.store.update("$share", this.id, this._memory, options).then(_handleUpdate, defer.reject);
    return defer.promise();
  };

  Instance.prototype.add = function(objects) {
    return this.toggle(objects, true);
  };

  Instance.prototype.remove = function(objects) {
    return this.toggle(objects, false);
  };

  Instance.prototype.toggle = function(objects, doAdd) {
    var updateMethod;
    if (!(this.hoodie.isPromise(objects) || $.isArray(objects))) {
      objects = [objects];
    }
    updateMethod = (function() {
      switch (doAdd) {
        case true:
          return this._add;
        case false:
          return this._remove;
        default:
          return this._toggle;
      }
    }).call(this);
    return this.hoodie.my.store.updateAll(objects, updateMethod);
  };

  Instance.prototype.sync = function() {
    var _this = this;
    if (this.hasAccount()) {
      return (this.sync = this._sync)();
    } else {
      return this.hoodie.my.account.signUp("share/" + this.id, this.password).done(function(username, response) {
        _this.save({
          _userRev: _this.hoodie.my.account._doc._rev
        });
        return (_this.sync = _this._sync)();
      });
    }
  };

  Instance.prototype.hasAccount = function() {
    return !this.anonymous || (this._userRev != null);
  };

  Instance.prototype._add = function(obj) {
    var newValue;
    newValue = obj.$shares ? !~obj.$shares.indexOf(this.id) ? obj.$shares.concat(this.id) : void 0 : [this.id];
    if (newValue) {
      delete this.$docsToRemove["" + obj.type + "/" + obj.id];
      this.set('$docsToRemove', this.$docsToRemove);
    }
    return {
      $shares: newValue
    };
  };

  Instance.prototype.$docsToRemove = {};

  Instance.prototype._remove = function(obj) {
    var $shares, idx;
    try {
      $shares = obj.$shares;
      if (~(idx = $shares.indexOf(this.id))) {
        $shares.splice(idx, 1);
        this.$docsToRemove["" + obj.type + "/" + obj.id] = {
          _rev: obj._rev
        };
        this.set('$docsToRemove', this.$docsToRemove);
        return {
          $shares: $shares.length ? $shares : void 0
        };
      }
    } catch (_error) {}
  };

  Instance.prototype._toggle = function() {
    var doAdd;
    try {
      doAdd = ~obj.$shares.indexOf(this.id);
    } catch (e) {
      doAdd = true;
    }
    if (doAdd) {
      return this._add(obj);
    } else {
      return this._remove(obj);
    }
  };

  Instance.prototype._sync = function() {
    var _this = this;
    return this.save().pipe(this.hoodie.my.store.findAll(this._isMySharedObjectAndChanged).pipe(function(sharedObjectsThatChanged) {
      return _this.hoodie.my.remote.sync(sharedObjectsThatChanged).then(_this._handleRemoteChanges);
    }));
  };

  Instance.prototype._isMySharedObjectAndChanged = function(obj) {
    var belongsToMe;
    belongsToMe = obj.id === this.id || obj.$shares && ~obj.$shares.indexOf(this.id);
    return belongsToMe && this.hoodie.my.store.isDirty(obj.type, obj.id);
  };

  Instance.prototype._handleRemoteChanges = function() {
    return console.log.apply(console, ['_handleRemoteChanges'].concat(__slice.call(arguments)));
  };

  return Instance;

})(Hoodie.RemoteStore);
