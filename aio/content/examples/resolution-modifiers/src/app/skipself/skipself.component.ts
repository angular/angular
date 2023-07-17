import { Component, SkipSelf } from '@angular/core';
import { LeafService } from '../leaf.service';

// #docregion skipself-component
@Component({
  selector: 'app-skipself',
  templateUrl: './skipself.component.html',
  styleUrls: ['./skipself.component.css'],
  // Angular would ignore this LeafService instance
  providers: [{ provide: LeafService, useValue: { emoji: '🍁' } }]
})
export class SkipselfComponent {
  // Use @SkipSelf() in the constructor
  constructor(@SkipSelf() public leaf: LeafService) { }
}
// #enddocregion skipself-component

// @SkipSelf(): Specifies that the dependency resolution should start from the parent injector, not here.
