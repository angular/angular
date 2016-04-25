import {InboxApp} from './inbox-app';
import {provide} from '@angular/core';
import {bootstrap} from '@angular/platform-browser';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {ROUTER_PROVIDERS} from '@angular/router';

export function main() {
  bootstrap(InboxApp,
            [ROUTER_PROVIDERS, provide(LocationStrategy, {useClass: HashLocationStrategy})]);
}
