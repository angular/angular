import {Component} from '@angular/core';

@Component({
    template: '<div (click)="c($event)"></div>',
    standalone: false
})
class Comp {
  c(event: any) {}
}
