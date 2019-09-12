/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {ExpectNumericType, LowercasePipe, PrivateReference, WrongFieldReference, WrongSubFieldReference} from './expression-cases';
import {UnknownEven, UnknownPeople, UnknownTrackBy} from './ng-for-cases';
import {ShowIf} from './ng-if-cases';
import {AttributeBinding, CaseIncompleteOpen, CaseMissingClosing, CaseUnknown, EmptyInterpolation, EventBinding, ForLetIEqual, ForOfEmpty, ForOfLetEmpty, ForUsingComponent, NoValueAttribute, NumberModel, Pipes, PropertyBinding, References, StringModel, TemplateReference, TestComponent, TwoWayBinding} from './parsing-cases';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    AppComponent,
    CaseIncompleteOpen,
    CaseMissingClosing,
    CaseUnknown,
    Pipes,
    TemplateReference,
    NoValueAttribute,
    AttributeBinding,
    StringModel,
    NumberModel,
    PropertyBinding,
    EventBinding,
    TwoWayBinding,
    EmptyInterpolation,
    ForOfEmpty,
    ForOfLetEmpty,
    ForLetIEqual,
    ForUsingComponent,
    References,
    TestComponent,
    WrongFieldReference,
    WrongSubFieldReference,
    PrivateReference,
    ExpectNumericType,
    UnknownPeople,
    UnknownEven,
    UnknownTrackBy,
    ShowIf,
    LowercasePipe,
  ]
})
export class AppModule {
}

declare function bootstrap(v: any): void;

    bootstrap(AppComponent);
