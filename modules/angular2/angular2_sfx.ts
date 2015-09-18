import * as ng from './angular2';
// the router and http should have their own SFX bundle
// But currently the module arithmetic 'angular2/router_sfx - angular2/angular2',
// is not support by system builder.
import * as router from './router';
import * as http from './http';

var _prevNg = (<any>window).ng;

(<any>window).ng = ng;


(<any>window).ngRouter = router;
(<any>window).ngHttp = http;
/**
 * Calling noConflict will restore window.angular to its pre-angular loading state
 * and return the angular module object.
 */
(<any>ng).noConflict = function() {
  (<any>window).ng = _prevNg;
  return ng;
};
