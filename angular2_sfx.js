'use strict';var ng = require('./angular2');
// the router and http should have their own SFX bundle
// But currently the module arithmetic 'angular2/router_sfx - angular2/angular2',
// is not support by system builder.
var router = require('./router');
var http = require('./http');
var _prevNg = window.ng;
window.ng = ng;
window.ngRouter = router;
window.ngHttp = http;
/**
 * Calling noConflict will restore window.angular to its pre-angular loading state
 * and return the angular module object.
 */
ng.noConflict = function () {
    window.ng = _prevNg;
    return ng;
};
//# sourceMappingURL=angular2_sfx.js.map