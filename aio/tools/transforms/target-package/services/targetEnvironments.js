module.exports = function targetEnvironments() {
  var _targets = Object.create(null);
  var _activeCount = 0;

  var checkAllowed = function(target) {
    if (!(target in _targets)) {
      throw new Error(
          'Error accessing target "' + target + '". It is not in the list of allowed targets: ' +
          Object.keys(_targets));
    }
  };

  var updateActiveCount = function() {
    _activeCount = 0;
    for (let target in _targets) {
      if (_targets[target]) _activeCount++;
    }
  };

  return {
    addAllowed: function(target, isActive) {
      _targets[target] = !!isActive;
      updateActiveCount();
    },
    removeAllowed: function(target) {
      delete _targets[target];
      updateActiveCount();
    },
    activate: function(target) {
      checkAllowed(target);
      _targets[target] = true;
      updateActiveCount();
    },
    deactivate: function(target) {
      checkAllowed(target);
      _targets[target] = false;
      updateActiveCount();
    },
    isActive: function(target) {
      checkAllowed(target);
      return _targets[target];
    },
    hasActive: function() { return _activeCount > 0; },
    someActive: function(targets) {
      for (var i = 0, ii = targets.length; i < ii; i++) {
        if (this.isActive(targets[i])) return true;
      }
      return false;
    }
  };
};
