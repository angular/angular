import {Component, ContentChildren, ElementRef, QueryList, ViewChild} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template: '<span #span><ng-content/></span>',
})
export class TestCmp {
  @ViewChild('span') span: ElementRef = null!;
  @ContentChildren('projected') projected: QueryList<unknown> = null!;
}
