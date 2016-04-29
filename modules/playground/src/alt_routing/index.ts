import {InboxApp} from './inbox-app';
import {provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {HashLocationStrategy, LocationStrategy} from 'angular2/platform/common';
import {ROUTER_PROVIDERS} from 'angular2/router';

export function main() {
  bootstrap(InboxApp,
            [ROUTER_PROVIDERS, provide(LocationStrategy, {useClass: HashLocationStrategy})]);
}
