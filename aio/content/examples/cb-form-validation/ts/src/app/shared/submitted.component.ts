// #docregion
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Hero } from './hero';

@Component({
  selector: 'hero-submitted',
  template: `
  <div *ngIf="submitted">
    <h2>You submitted the following:</h2>
    <div class="row">
      <div class="col-xs-3">Name</div>
      <div class="col-xs-9  pull-left">{{ hero.name }}</div>
    </div>
    <div class="row">
      <div class="col-xs-3">Alter Ego</div>
      <div class="col-xs-9 pull-left">{{ hero.alterEgo }}</div>
    </div>
    <div class="row">
      <div class="col-xs-3">Power</div>
      <div class="col-xs-9 pull-left">{{ hero.power }}</div>
    </div>
    <br>
    <button class="btn btn-default" (click)="onClick()">Edit</button>
  </div>`
})
export class SubmittedComponent {
  @Input()  hero: Hero;
  @Input()  submitted = false;
  @Output() submittedChange = new EventEmitter<boolean>();
  onClick() { this.submittedChange.emit(false); }
}
