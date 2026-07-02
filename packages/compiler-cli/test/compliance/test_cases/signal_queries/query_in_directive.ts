import {contentChild, contentChildren, Directive, forwardRef, viewChild, viewChildren} from '@angular/core';

export class SomeToken {}

const nonAnalyzableRefersToString = 'a, b, c';

@Directive({
})
export class TestDir {
  query1 = viewChild('locatorA');
  query2 = viewChildren('locatorB');
  query3 = contentChild('locatorC');
  query4 = contentChildren('locatorD');

  query5 = viewChild(forwardRef(() => SomeToken));
  query6 = viewChildren(SomeToken);
  query7 = viewChild('locatorE', {read: SomeToken});
  query8 = contentChildren('locatorF, locatorG', {descendants: true});
  query9 = contentChildren(nonAnalyzableRefersToString, {descendants: true});
}
