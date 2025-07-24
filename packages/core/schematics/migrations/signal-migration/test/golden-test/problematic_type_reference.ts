// tslint:disable

import {Component, Directive, QueryList, Input} from '@angular/core';

@Component({
  template: `
    {{label}}
  `,
})
class Group {
  @Input() label!: string;
}

@Directive()
class Base {
  _items = new QueryList<{
    label: string;
  }>();
}

@Directive({})
class Option extends Base {
  _items = new QueryList<Group>();
}
