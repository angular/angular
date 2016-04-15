import {XHR} from 'angular2/src/compiler/xhr';

import {SpyObject, proxy} from 'angular2/testing_internal';

export class SpyXHR extends SpyObject {
  constructor() { super(XHR); }
}
