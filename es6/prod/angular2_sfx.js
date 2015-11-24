import * as ng from './angular2';
import * as router from './router';
import * as http from './http';
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