import {HttpCmp} from './http_comp';
import {bootstrap} from 'angular2/bootstrap';
import {HTTP_BINDINGS} from 'http/http';

export function main() {
  // This entry point is not transformed and exists for testing dynamic mode.
  bootstrap(HttpCmp, [HTTP_BINDINGS]);
}
