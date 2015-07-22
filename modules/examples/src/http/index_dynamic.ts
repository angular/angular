import {HttpCmp} from './http_comp';
import {bootstrap} from 'angular2/bootstrap';
import {httpInjectables} from 'angular2/http';

export function main() {
  // This entry point is not transformed and exists for testing dynamic mode.
  bootstrap(HttpCmp, [httpInjectables]);
}
