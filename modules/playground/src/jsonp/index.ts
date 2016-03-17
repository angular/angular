import {bootstrap} from 'angular2/platform/browser';
import {JSONP_PROVIDERS} from 'angular2/http';
import {JsonpCmp} from './jsonp_comp';

export function main() {
  bootstrap(JsonpCmp, [JSONP_PROVIDERS]);
}
