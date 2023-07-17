import {Directive} from '@angular/core';

@Directive({host: {'(click)': 'c($event)'}})
class Dir {
  c(event: any) {}
}
