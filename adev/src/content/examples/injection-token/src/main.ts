// TODO: Add unit tests for this file.
/* eslint-disable @angular-eslint/no-output-native */
// #docregion
import {Injector, InjectionToken} from '@angular/core';

interface MyInterface {
  someProperty: string;
}

// #docregion InjectionToken

const TOKEN = new InjectionToken<MyInterface>('SomeToken');

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
