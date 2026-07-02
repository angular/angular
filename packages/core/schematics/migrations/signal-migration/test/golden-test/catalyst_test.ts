// tslint:disable

import {Input} from '@angular/core';

// google3/javascript/angular2/testing/catalyst/fake_async
// ^^ this allows the advisor to even consider this file.

function it(msg: string, fn: () => void) {}
function bootstrapTemplate(tmpl: string, inputs: unknown) {}

class MyComp {
  @Input() hello = '';
}

it('should work', () => {
  const inputs = {
    hello: 'test',
  } as Partial<MyComp>;
  bootstrapTemplate('<my-comp [hello]="hello">', inputs);
});
