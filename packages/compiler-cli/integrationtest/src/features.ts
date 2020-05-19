/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as common from '@angular/common';
import {Component, CUSTOM_ELEMENTS_SCHEMA, Directive, EventEmitter, forwardRef, Inject, InjectionToken, NgModule, Output} from '@angular/core';
import {Observable} from 'rxjs';

import {wrapInArray} from './funcs';

export const SOME_INJECTON_TOKEN = new InjectionToken('injectionToken');

@Component({
  selector: 'comp-providers',
  template: '',
  providers: [
    {provide: 'strToken', useValue: forwardRef(() => 'strValue')},
    {provide: SOME_INJECTON_TOKEN, useValue: 10},
    {provide: 'reference', useValue: common.NgIf},
    {provide: 'complexToken', useValue: {a: 1, b: ['test', SOME_INJECTON_TOKEN]}},
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

@Component({
  selector: 'cmp-event',
  template: `
    <div (click)="handleDomEventVoid($event)"></div>
    <div (click)="handleDomEventPreventDefault($event)"></div>
    <div (dirEvent)="handleDirEvent($event)"></div>
  `,
})
export class CompConsumingEvents {
  handleDomEventVoid(e: any): void {}
  handleDomEventPreventDefault(e: any): boolean {
    return false;
  }
  handleDirEvent(e: any): void {}
}

@Directive({
  selector: '[dirEvent]',
})
export class DirPublishingEvents {
  @Output('dirEvent') dirEvent: Observable<string> = new EventEmitter();
}

@NgModule({schemas: [CUSTOM_ELEMENTS_SCHEMA], declarations: wrapInArray(CompUsingCustomElements)})
export class ModuleUsingCustomElements {
}
