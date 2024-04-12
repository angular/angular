import {Component} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-parent',
  template: '<app-child></app-child>',
})
export class ParentComponent {}
