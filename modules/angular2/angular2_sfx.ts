import * as ng from './angular2';
// the router should have its own SFX bundle
// But currently the module arithemtic 'angular2/router_sfx - angular2/angular2',
// is not support by system builder.
import * as router from './router';

var _prevNg = (<any>window).ng;

(<any>window).ng = ng;


(<any>window).ngRouter = router;
/**
 * Calling noConflict will restore window.angular to its pre-angular loading state
 * and return the angular module object.
 */
(<any>ng).noConflict = function() {
  (<any>window).ng = _prevNg;
  return ng;
};
