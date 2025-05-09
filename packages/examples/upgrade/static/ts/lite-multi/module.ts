/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docplaster
import {
  Component,
  Directive,
  ElementRef,
  getPlatform,
  Injectable,
  Injector,
  NgModule,
  StaticProvider,
} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';
import {
  downgradeComponent,
  downgradeInjectable,
  downgradeModule,
  UpgradeComponent,
} from '@angular/upgrade/static';

declare var angular: ng.IAngularStatic;

// An Angular module that declares an Angular service and a component,
// which in turn uses an upgraded AngularJS component.
@Component({
  selector: 'ng2A',
  template: 'Component A | <ng1A></ng1A>',
  standalone: false,
})
export class Ng2AComponent {}

@Directive({
  selector: 'ng1A',
  standalone: false,
})
export class Ng1AComponentFacade extends UpgradeComponent {
  constructor(elementRef: ElementRef, injector: Injector) {
    super('ng1A', elementRef, injector);
  }
}

@Injectable()
export class Ng2AService {
  getValue() {
    return 'ng2';
  }
}

@NgModule({
  imports: [BrowserModule],
  providers: [Ng2AService],
  declarations: [Ng1AComponentFacade, Ng2AComponent],
})
export class Ng2AModule {
  ngDoBootstrap() {}
}

// Another Angular module that declares an Angular component.
@Component({
  selector: 'ng2B',
  template: 'Component B',
  standalone: false,
})
export class Ng2BComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [Ng2BComponent],
})
export class Ng2BModule {
  ngDoBootstrap() {}
}

// The downgraded Angular modules.
const downgradedNg2AModule = downgradeModule((extraProviders: StaticProvider[]) =>
  (getPlatform() || platformBrowser(extraProviders)).bootstrapModule(Ng2AModule),
);

const downgradedNg2BModule = downgradeModule((extraProviders: StaticProvider[]) =>
  (getPlatform() || platformBrowser(extraProviders)).bootstrapModule(Ng2BModule),
);

// The AngularJS app including downgraded modules, components and injectables.
const appModule = angular
  .module('exampleAppModule', [downgradedNg2AModule, downgradedNg2BModule])
  .component('exampleApp', {
    template: `
        <nav>
          <button ng-click="$ctrl.page = page" ng-repeat="page in ['A', 'B']">
            Page {{ page }}
          </button>
        </nav>
        <hr />
        <main ng-switch="$ctrl.page">
          <ng2-a ng-switch-when="A"></ng2-a>
          <ng2-b ng-switch-when="B"></ng2-b>
        </main>
      `,
    controller: class ExampleAppController {
      page = 'A';
    },
  })
  .component('ng1A', {
    template: 'ng1({{ $ctrl.value }})',
    controller: [
      'ng2AService',
      class Ng1AController {
        value: string;
        constructor(private ng2AService: Ng2AService) {
          this.value = this.ng2AService.getValue();
        }
      },
    ],
  })
  .directive(
    'ng2A',
    downgradeComponent({
      component: Ng2AComponent,
      // Since there is more than one downgraded Angular module,
      // specify which module this component belongs to.
      downgradedModule: downgradedNg2AModule,
      propagateDigest: false,
    }),
  )
  .directive(
    'ng2B',
    downgradeComponent({
      component: Ng2BComponent,
      // Since there is more than one downgraded Angular module,
      // specify which module this component belongs to.
      downgradedModule: downgradedNg2BModule,
      propagateDigest: false,
    }),
  )
  .factory('ng2AService', downgradeInjectable(Ng2AService, downgradedNg2AModule));

// Bootstrap the AngularJS app.
angular.bootstrap(document.body, [appModule.name]);
