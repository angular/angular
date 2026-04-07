import {Component} from '@angular/core';

@Component({
  template: `
    @let simple = [...foo];
    @let otherEntries = [1, ...foo, 2];
    @let multipleSpreads = [...foo, 1, ...bar, ...baz, 2];
    @let inlineArraySpread = [1, ...[2, ...[3]]];

    <!-- Use the arrays so they don't get flagged as unused. -->
    {{simple}} {{otherEntries}} {{multipleSpreads}} {{inlineArraySpread}}
  `,
})
export class ArrayComp {
  foo = [];
  bar = [];
  baz = [];
}
