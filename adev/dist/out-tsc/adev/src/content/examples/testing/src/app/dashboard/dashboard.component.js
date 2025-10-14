import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component} from '@angular/core';
import {sharedImports} from '../shared/shared';
import {DashboardHeroComponent} from './dashboard-hero.component';
let DashboardComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-dashboard',
      templateUrl: './dashboard.component.html',
      styleUrls: ['./dashboard.component.css'],
      imports: [DashboardHeroComponent, sharedImports],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DashboardComponent = class {
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
      DashboardComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    router;
    heroService;
    heroes = [];
    // #docregion ctor
    constructor(router, heroService) {
      this.router = router;
      this.heroService = heroService;
    }
    // #enddocregion ctor
    ngOnInit() {
      this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes.slice(1, 5)));
    }
    // #docregion goto-detail
    gotoDetail(hero) {
      const url = `/heroes/${hero.id}`;
      this.router.navigateByUrl(url);
    }
    // #enddocregion goto-detail
    get title() {
      const cnt = this.heroes.length;
      return cnt === 0 ? 'No Heroes' : cnt === 1 ? 'Top Hero' : `Top ${cnt} Heroes`;
    }
  };
  return (DashboardComponent = _classThis);
})();
export {DashboardComponent};
//# sourceMappingURL=dashboard.component.js.map
