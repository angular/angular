// tslint:disable

import {Input} from '@angular/core';

// angular2/testing/catalyst
// ^^ this allows the advisor to even consider this file.

function it(msg: string, fn: () => void) {}
function bootstrapTemplate(tmpl: string, inputs: unknown) {}

class MyComp {
  @Input() hello = '';
}

it('should work', () => {
  const inputs = {
    hello: 'Damn',
    // TODO:
  } as Partial<MyComp>;
  bootstrapTemplate('<my-comp [hello]="hello">', inputs);
});
