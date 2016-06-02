import {Component, ViewChild} from '@angular/core';

@Component({
  selector: 'cmp-query-child',
  template: `
    <div>Child</div>
  `,
  directives: []
})
export class CompWithQueryChild {}


@Component({
  selector: 'cmp-query',
  template: '<cmp-query-child></cmp-query-child>',
  directives: [CompWithQueryChild]
})
export class CompWithQuery {
  @ViewChild(CompWithQueryChild) ref:CompWithQueryChild;
}
