import * as angular from './angular2';
// the router should have its own SFX bundle
// But currently the module arithemtic 'angular2/router_sfx - angular2/angular2',
// is not support by system builder.
import * as router from './router';

angular.router = router;

var _prevAngular = window.angular;

/**
 * Calling noConflict will restore window.angular to its pre-angular loading state
 * and return the angular module object.
 */
angular.noConflict = function() {
  window.angular = _prevAngular;
  return angular;
};

window.angular = angular;
