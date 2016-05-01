import { bootstrap } from 'angular2/platform/browser';
import { NG_VALIDATORS } from 'angular2/common';
import { Provider } from 'angular2/core';
let MyApp = null;
let myValidator = null;
// #docregion ng_validators
bootstrap(MyApp, [new Provider(NG_VALIDATORS, { useValue: myValidator, multi: true })]);
// #enddocregion
