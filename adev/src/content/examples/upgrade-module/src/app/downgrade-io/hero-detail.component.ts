// #docregion
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Hero } from '../hero';

@Component({
  selector: 'hero-detail',
  template: `
    <h2>{{hero.name}} details!</h2>
    <div>id: {{hero.id}}</div>
    <button type="button" (click)="onDelete()">Delete</button>
  `
})
export class HeroDetailComponent {
  @Input() hero!: Hero;
  @Output() deleted = new EventEmitter<Hero>();
  onDelete() {
    this.deleted.emit(this.hero);
  }
}
