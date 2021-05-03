import {Component} from '@angular/core';

@Component({template: '<div (click)="c($event)"></div>'})
class Comp {
  c(event: any) {}
}
