// #docregion
export const heroDetail = {
  bindings: {
    hero: '='
  },
  template: `
    <h2>{{$ctrl.hero.name}}</h2>
    <div>
      <ng-transclude></ng-transclude>
    </div>
  `
};
// #enddocregion

import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { Hero } from '../hero';

@Directive({
  selector: 'hero-detail'
})
export class HeroDetailDirective extends UpgradeComponent {
  @Input() hero: Hero;

  constructor(elementRef: ElementRef, injector: Injector) {
    super('heroDetail', elementRef, injector);
  }
}
