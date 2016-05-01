import {bootstrap} from '@angular/platform-browser-dynamic';
import {NG_VALIDATORS} from '@angular/common';
import {Provider} from '@angular/core';

let MyApp: Function = null;
let myValidator: any = null;

// #docregion ng_validators
bootstrap(MyApp, [new Provider(NG_VALIDATORS, {useValue: myValidator, multi: true})]);
// #enddocregion
