import {ContentChild, contentChild, Directive, ViewChild, viewChild} from '@angular/core';

@Directive({
})
export class TestDir {
  @ViewChild('locator1') decoratorViewChild: unknown;
  signalViewChild = viewChild('locator1');

  @ContentChild('locator2') decoratorContentChild: unknown;
  signalContentChild = contentChild('locator2');
}
