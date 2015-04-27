'use strict';

(function (exports) {

Zone.vmTurnAware = {
  '$run': function (parentRun) {
    return function() {
      var result;
      var oldZone = exports.zone;

      if (!Zone.hasExecutedInnerCode) {
        Zone.hasExecutedInnerCode = true;
        exports.zone = this;
        this.beforeTurn();
        exports.zone = oldZone;
      }

      return parentRun.apply(this, arguments);
    }
  }
};

}((typeof module !== 'undefined' && module && module.exports) ?
    module.exports : window));


