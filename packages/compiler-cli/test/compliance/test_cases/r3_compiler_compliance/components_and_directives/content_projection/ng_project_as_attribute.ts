import {Component} from '@angular/core';

@Component({
    selector: 'my-app', template: '<div *ngIf="show" ngProjectAs=".someclass"></div>',
    standalone: false
})
export class MyApp {
  show = true;
}
