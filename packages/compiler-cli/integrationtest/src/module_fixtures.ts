/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Injectable, InjectionToken, Input, NgModule, Pipe} from '@angular/core';

@Injectable()
export class SomeService {
  public prop = 'someValue';
}

@Injectable()
export class ServiceUsingLibModule {
}

@Directive({selector: '[someDir]', host: {'[title]': 'someDir'}})
export class SomeDirectiveInRootModule {
  @Input() someDir: string;
}

@Directive({selector: '[someDir]', host: {'[title]': 'someDir'}})
export class SomeDirectiveInLibModule {
  @Input() someDir: string;
}

@Pipe({name: 'somePipe'})
export class SomePipeInRootModule {
  transform(value: string): any {
    return `transformed ${value}`;
  }
}

@Pipe({name: 'somePipe'})
export class SomePipeInLibModule {
  transform(value: string): any {
    return `transformed ${value}`;
  }
}

@Component({selector: 'comp', template: `<div  [someDir]="'someValue' | somePipe"></div>`})
export class CompUsingRootModuleDirectiveAndPipe {
}

@Component({selector: 'comp', template: `<div  [someDir]="'someValue' | somePipe"></div>`})
export class CompUsingLibModuleDirectiveAndPipe {
}

export const SOME_TOKEN = new InjectionToken('someToken');

@NgModule({
  declarations: [SomeDirectiveInLibModule, SomePipeInLibModule, CompUsingLibModuleDirectiveAndPipe],
  exports: [CompUsingLibModuleDirectiveAndPipe],
})
export class SomeLibModule {
  static withProviders() {
    return {
      ngModule: SomeLibModule,
      providers: [
        ServiceUsingLibModule,
      ]
    };
  }
}
