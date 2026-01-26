/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/* eslint-disable @angular-eslint/no-output-native */
// #docregion
import {Injector, InjectionToken} from '@angular/core';

export interface MyInterface {
  someProperty: string;
}

// #docregion InjectionToken

export const TOKEN = new InjectionToken<MyInterface>('SomeToken');

// Setting up the provider using the same token instance
const providers = [
  {provide: TOKEN, useValue: {someProperty: 'exampleValue'}}, // Mock value for MyInterface
];

// Creating the injector with the provider
const injector = Injector.create({providers});

// Retrieving the value using the same token instance
const myInterface = injector.get(TOKEN);
// myInterface is inferred to be MyInterface.

// #enddocregion InjectionToken
