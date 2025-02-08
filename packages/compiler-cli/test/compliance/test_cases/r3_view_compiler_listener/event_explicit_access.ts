import {Component} from '@angular/core';

@Component({
    template: '<div (click)="c(this.$event)"></div>',
    standalone: false
})
class Comp {
  $event = {};

  c(value: {}) {}
}
