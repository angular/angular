import {Injectable, NgModule} from '@angular/core';

@NgModule({})
export class Lib1Module {}

@Injectable({providedIn: Lib1Module})
export class Service {
  static instance = 0;
  readonly instance = Service.instance++;
}
