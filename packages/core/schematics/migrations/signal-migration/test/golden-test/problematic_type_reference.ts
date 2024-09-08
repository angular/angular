// tslint:disable

import {Component, Directive, QueryList, Input} from '@angular/core';

@Component({
  template: `
    {{label}}
  `,
  standalone: false,
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

@Directive({
  standalone: false,
})
class Option extends Base {
  _items = new QueryList<Group>();
}
