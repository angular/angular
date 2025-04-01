import {Directive} from '@angular/core';

@Directive({
    host: { '(click)': 'c($event)' },
    standalone: false
})
class Dir {
  c(event: any) {}
}
