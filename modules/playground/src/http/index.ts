import {bootstrap} from '@angular/platform-browser';
import {HTTP_PROVIDERS} from '@angular/http';
import {HttpCmp} from './app/http_comp';

export function main() {
  bootstrap(HttpCmp, [HTTP_PROVIDERS]);
}
