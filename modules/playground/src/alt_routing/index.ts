import {InboxApp} from './app/inbox-app';
import {provide, ComponentResolver, SystemJsComponentResolver} from '@angular/core';
import {RuntimeCompiler} from '@angular/compiler';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {ROUTER_PROVIDERS} from '@angular/router';

export function main() {
  bootstrap(InboxApp,
            [
              provide(ComponentResolver, {useFactory: (c) => new SystemJsComponentResolver(c), deps: [RuntimeCompiler]}),
              ROUTER_PROVIDERS, provide(LocationStrategy, {useClass: HashLocationStrategy})
            ]);
}
