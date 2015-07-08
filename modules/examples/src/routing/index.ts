import {InboxApp} from './inbox-app';
import {bootstrap, bind} from 'angular2/angular2';
import {routerInjectables, HashLocationStrategy, LocationStrategy} from 'angular2/router';
import {httpInjectables} from 'angular2/http';

export function main() {
  bootstrap(
      InboxApp,
      [routerInjectables, httpInjectables, bind(LocationStrategy).toClass(HashLocationStrategy)]);
}
