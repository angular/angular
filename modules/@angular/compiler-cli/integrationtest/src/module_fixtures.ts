/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LowerCasePipe, NgIf} from '@angular/common';
import {ANALYZE_FOR_ENTRY_COMPONENTS, Component, ComponentFactoryResolver, Directive, Inject, Injectable, Input, ModuleWithProviders, NgModule, OpaqueToken, Pipe} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Injectable()
export class SomeService {
  public prop = 'someValue';
}

@Injectable()
export class ServiceUsingLibModule {
}

@Directive({selector: '[someDir]', host: {'[title]': 'someDir'}})
export class SomeDirectiveInRootModule {
  @Input()
  someDir: string;
}

@Directive({selector: '[someDir]', host: {'[title]': 'someDir'}})
export class SomeDirectiveInLibModule {
  @Input()
  someDir: string;
}

@Pipe({name: 'somePipe'})
export class SomePipeInRootModule {
  transform(value: string): any { return `transformed ${value}`; }
}

@Pipe({name: 'somePipe'})
export class SomePipeInLibModule {
  transform(value: string): any { return `transformed ${value}`; }
}

@Component({selector: 'comp', template: `<div  [someDir]="'someValue' | somePipe"></div>`})
export class CompUsingRootModuleDirectiveAndPipe {
}

@Component({selector: 'comp', template: `<div  [someDir]="'someValue' | somePipe"></div>`})
export class CompUsingLibModuleDirectiveAndPipe {
}

export const SOME_TOKEN = new OpaqueToken('someToken');

export function provideValueWithEntryComponents(value: any) {
  return [
    {provide: SOME_TOKEN, useValue: value},
    {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: value, multi: true},
  ];
}

@NgModule({
  declarations: [SomeDirectiveInLibModule, SomePipeInLibModule, CompUsingLibModuleDirectiveAndPipe],
  exports: [CompUsingLibModuleDirectiveAndPipe],
  entryComponents: [CompUsingLibModuleDirectiveAndPipe],
})
export class SomeLibModule {
}

// TODO(tbosch): Make this a static method in `SomeLibModule` once
// our static reflector supports it.
// See https://github.com/angular/angular/issues/10266.
export function someLibModuleWithProviders(): ModuleWithProviders {
  return {
    ngModule: SomeLibModule,
    providers: [
      ServiceUsingLibModule,
      provideValueWithEntryComponents([{a: 'b', component: CompUsingLibModuleDirectiveAndPipe}])
    ]
  };
}
