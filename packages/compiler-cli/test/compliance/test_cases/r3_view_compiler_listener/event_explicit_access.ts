import {Component} from '@angular/core';

@Component({template: '<div (click)="c(this.$event)"></div>'})
class Comp {
  $event = {};

  c(value: {}) {}
}
