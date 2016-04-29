import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {HttpCmp} from './http_comp';

export function main() {
  bootstrap(HttpCmp, [HTTP_PROVIDERS]);
}
