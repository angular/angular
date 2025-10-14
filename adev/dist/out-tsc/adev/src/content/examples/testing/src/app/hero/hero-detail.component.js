import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {sharedImports} from '../shared/shared';
import {HeroDetailService} from './hero-detail.service';
// #docregion prototype
let HeroDetailComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-detail',
      templateUrl: './hero-detail.component.html',
      styleUrls: ['./hero-detail.component.css'],
      providers: [HeroDetailService],
      imports: [...sharedImports],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroDetailComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      HeroDetailComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // #docregion inject
    heroDetailService = inject(HeroDetailService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    // #enddocregion inject
    // #enddocregion prototype
    hero;
    // #docregion ctor
    constructor() {
      // get hero when `id` param changes
      this.route.paramMap.subscribe((pmap) => this.getHero(pmap.get('id')));
    }
    // #enddocregion ctor
    getHero(id) {
      // when no id or id===0, create new blank hero
      if (!id) {
        this.hero = {id: 0, name: ''};
        return;
      }
      this.heroDetailService.getHero(id).subscribe((hero) => {
        if (hero) {
          this.hero = hero;
        } else {
          this.gotoList(); // id not found; navigate to list
        }
      });
    }
    save() {
      this.heroDetailService.saveHero(this.hero).subscribe(() => this.gotoList());
    }
    cancel() {
      this.gotoList();
    }
    gotoList() {
      this.router.navigate(['../'], {relativeTo: this.route});
    }
  };
  return (HeroDetailComponent = _classThis);
})();
export {HeroDetailComponent};
// #enddocregion prototype
//# sourceMappingURL=hero-detail.component.js.map
