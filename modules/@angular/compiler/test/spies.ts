import {XHR} from '@angular/compiler/src/xhr';

import {SpyObject, proxy} from '@angular/testing/testing_internal';

export class SpyXHR extends SpyObject {
  constructor() { super(XHR); }
}
