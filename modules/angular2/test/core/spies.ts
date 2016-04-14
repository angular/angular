import {
  ChangeDetectorRef,
} from 'angular2/src/core/change_detection/change_detection';

import {ElementRef} from 'angular2/src/core/linker/element_ref';
import {DomAdapter} from 'angular2/src/platform/dom/dom_adapter';

import {SpyObject, proxy} from 'angular2/testing_internal';

export class SpyChangeDetectorRef extends SpyObject {
  constructor() { super(ChangeDetectorRef); }
}

export class SpyIterableDifferFactory extends SpyObject {}

export class SpyElementRef extends SpyObject {
  constructor() { super(ElementRef); }
}

export class SpyDomAdapter extends SpyObject {
  constructor() { super(DomAdapter); }
}
