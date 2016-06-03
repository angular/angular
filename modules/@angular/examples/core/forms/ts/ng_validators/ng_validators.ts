import {bootstrap} from '@angular/platform-browser';
import {NG_VALIDATORS} from '@angular/common';

let MyApp: Function = null;
let myValidator: any = null;

// #docregion ng_validators
bootstrap(MyApp, [{provide: NG_VALIDATORS, useValue: myValidator, multi: true}]);
// #enddocregion
