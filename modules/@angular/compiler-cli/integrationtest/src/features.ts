/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as common from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, Component, Inject, NgModule, OpaqueToken} from '@angular/core';

import {wrapInArray} from './funcs';

export const SOME_OPAQUE_TOKEN = new OpaqueToken('opaqueToken');

@Component({
  selector: 'comp-providers',
  template: '',
  providers: [
    {provide: 'strToken', useValue: 'strValue'},
    {provide: SOME_OPAQUE_TOKEN, useValue: 10},
    {provide: 'reference', useValue: common.NgIf},
    {provide: 'complexToken', useValue: {a: 1, b: ['test', SOME_OPAQUE_TOKEN]}},
  ]
})
export class CompWithProviders {
  constructor(@Inject('strToken') public ctxProp: string) {}
}

@Component({
  selector: 'cmp-reference',
  template: `
    <input #a [(ngModel)]="foo" required>{{a.value}}
    <div *ngIf="true">{{a.value}}</div>
  `
})
export class CompWithReferences {
  foo: string;
}

@Component({selector: 'cmp-pipes', template: `<div *ngIf>{{test | somePipe}}</div>`})
export class CompUsingPipes {
}

@Component({
  selector: 'cmp-custom-els',
  template: `
    <some-custom-element [someUnknownProp]="true"></some-custom-element>
  `,
})
export class CompUsingCustomElements {
}

@NgModule({schemas: [CUSTOM_ELEMENTS_SCHEMA], declarations: wrapInArray(CompUsingCustomElements)})
export class ModuleUsingCustomElements {
}
