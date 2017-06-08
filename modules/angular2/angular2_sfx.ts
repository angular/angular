import * as ng from './angular2';
// the router should have its own SFX bundle
// But currently the module arithemtic 'angular2/router_sfx - angular2/angular2',
// is not support by system builder.
import * as router from './router';

var angular: AngularOne = <any>ng;
(<AngularWindow>window).angular = angular;

var _prevAngular = (<AngularWindow>window).angular;


angular.router = router;
/**
 * Calling noConflict will restore window.angular to its pre-angular loading state
 * and return the angular module object.
 */
angular.noConflict = function() {
  (<AngularWindow>window).angular = _prevAngular;
  return angular;
};

interface AngularOne {
  router: any;
  noConflict(): any;
}

interface AngularWindow extends Window {
  angular: any;
}
