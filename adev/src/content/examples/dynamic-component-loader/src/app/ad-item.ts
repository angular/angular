// #docregion
import { Type } from '@angular/core';

export class AdItem {
  constructor(public component: Type<any>, public data: any) {}
}
