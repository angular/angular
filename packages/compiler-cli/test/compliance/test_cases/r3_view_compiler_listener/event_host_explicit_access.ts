import {Directive} from '@angular/core';

@Directive({
  host: {
    '(click)': 'c(this.$event)',
  }
})
class Dir {
  $event = {};
  c(value: {}) {}
}
