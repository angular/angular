import {InboxApp} from './inbox-app';
import {bootstrap} from 'angular2/angular2';
import {routerInjectables} from 'angular2/router';
import {httpInjectables} from 'angular2/http';

export function main() {
  bootstrap(InboxApp, [routerInjectables, httpInjectables]);
}
