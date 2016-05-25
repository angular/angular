import {Component, QueryList, ViewChild, ViewChildren} from '@angular/core';

@Component({selector: 'comp-for-child-query', template: 'child'})
export class CompForChildQuery {
}

@Component({
  selector: 'comp-with-child-query',
  template: '<comp-for-child-query></comp-for-child-query>',
  directives: [CompForChildQuery]
})
export class CompWithChildQuery {
  @ViewChild(CompForChildQuery) child: CompForChildQuery;
  @ViewChildren(CompForChildQuery) children: QueryList<CompForChildQuery>;
}
