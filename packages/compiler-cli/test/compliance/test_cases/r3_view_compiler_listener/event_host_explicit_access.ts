import {Directive} from '@angular/core';

@Directive({
    host: {
        '(click)': 'c(this.$event)',
    },
    standalone: false
})
class Dir {
  $event = {};
  c(value: {}) {}
}
