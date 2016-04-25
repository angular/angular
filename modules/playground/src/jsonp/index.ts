import {bootstrap} from '@angular/platform-browser';
import {JSONP_PROVIDERS} from '@angular/http/http';
import {JsonpCmp} from './jsonp_comp';

export function main() {
  bootstrap(JsonpCmp, [JSONP_PROVIDERS]);
}
