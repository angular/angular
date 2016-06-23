/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from '@angular/core/testing';

var value: any;
var element: any;
var exception: any;

abstract class OtherClass {}
class SomeClass {}

// #docregion toBePromise
expect(value).toBePromise();
// #enddocregion

// #docregion toBeAnInstanceOf
expect(value).toBeAnInstanceOf(SomeClass);
// #enddocregion

// #docregion toHaveText
expect(element).toHaveText('Hello world!');
// #enddocregion

// #docregion toHaveCssClass
expect(element).toHaveCssClass('current');
// #enddocregion

// #docregion toHaveCssStyle
expect(element).toHaveCssStyle({width: '100px', height: 'auto'});
// #enddocregion

// #docregion toContainError
expect(exception).toContainError('Failed to load');
// #enddocregion

// #docregion toImplement
expect(SomeClass).toImplement(OtherClass);
// #enddocregion
