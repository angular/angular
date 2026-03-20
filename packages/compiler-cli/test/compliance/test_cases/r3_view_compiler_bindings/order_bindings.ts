import {Component} from '@angular/core';

@Component({
  selector: 'some-elem',
  template: ``,
  inputs: ['attr1', 'prop1', 'attrInterp1', 'propInterp1'],
})
export class SomeCmp {}

@Component({
  selector: 'my-cmp',
  imports: [SomeCmp],
  host: {
    'literal1': 'foo',
    '(event1)': 'foo()',
    '[attr.attr1]': 'foo',
    '[id]': 'foo',
    '[class.class1]': 'false',
    '[style.style1]': 'true',
    '[class]': 'foo',
    '[style]': 'foo',
  },
  template: `
		<some-elem
			literal1="foo"
			(event1)="foo()"
			[attr.attr1]="foo"
			[prop1]="foo",
			[class.class1]="foo",
			[style.style1]="foo"
			style="foo"
			class="foo"
			attr.attrInterp1="interp {{foo}}"
			propInterp1="interp {{foo}}"
			/>
	`,
})
export class MyCmp {
  foo: any;
}
