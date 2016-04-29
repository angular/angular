import {bootstrap} from '@angular/platform-browser';
import {HTTP_PROVIDERS} from '@angular/http/http';
import {HttpCmp} from './http_comp';

export function main() {
  bootstrap(HttpCmp, [HTTP_PROVIDERS]);
}
