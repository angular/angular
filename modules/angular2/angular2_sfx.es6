import * as angular from './angular2';

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
