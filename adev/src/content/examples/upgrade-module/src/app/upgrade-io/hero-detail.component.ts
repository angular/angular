// #docregion
// #docregion hero-detail-io
export const heroDetail = {
  bindings: {
    hero: '<',
    deleted: '&'
  },
  template: `
    <h2>{{$ctrl.hero.name}} details!</h2>
    <div><label>id: </label>{{$ctrl.hero.id}}</div>
    <button type="button" ng-click="$ctrl.onDelete()">Delete</button>
  `,
  controller: function HeroDetailController() {
    this.onDelete = () => {
      this.deleted(this.hero);
    };
  }
};
// #enddocregion hero-detail-io

// #docregion hero-detail-io-upgrade
import { Directive, ElementRef, Injector, Input, Output, EventEmitter } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { Hero } from '../hero';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'hero-detail'
})
export class HeroDetailDirective extends UpgradeComponent {
  @Input() hero: Hero;
  @Output() deleted: EventEmitter<Hero>;

  constructor(elementRef: ElementRef, injector: Injector) {
    super('heroDetail', elementRef, injector);
  }
}
// #enddocregion hero-detail-io-upgrade
