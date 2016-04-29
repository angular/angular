import {ChangeDetectorRef} from '@angular/core/src/change_detection/change_detection';
import {ElementRef} from '@angular/core';
import {DomAdapter} from '@angular/platform-browser/src/dom/dom_adapter';
import {SpyObject} from '@angular/core/testing/testing_internal';

export class SpyChangeDetectorRef extends SpyObject {
  constructor() {
    super(ChangeDetectorRef);
    this.spy('detectChanges');
    this.spy('checkNoChanges');
  }
}

export class SpyIterableDifferFactory extends SpyObject {}

export class SpyElementRef extends SpyObject {
  constructor() { super(ElementRef); }
}

export class SpyDomAdapter extends SpyObject {
  constructor() { super(DomAdapter); }
}
