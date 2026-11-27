/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  destroyPlatform,
  Directive,
  ElementRef,
  Injector,
  Input,
  NgModule,
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {downgradeComponent, UpgradeComponent, UpgradeModule} from '../../../static';

import * as angular from '../../../src/common/src/angular1';
import {
  html,
  multiTrim,
  withEachNg1Version,
} from '../../../src/common/test/helpers/common_test_helpers';

import {$apply, bootstrap} from './static_test_helpers';

withEachNg1Version(() => {
  describe('content projection', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should instantiate ng2 in ng1 template and project content', async () => {
      // the ng2 component that will be used in ng1 (downgraded)
      @Component({
        selector: 'ng2',
        template: `{{ prop }}(<ng-content></ng-content>)`,
        standalone: false,
      })
      class Ng2Component {
        prop = 'NG2';
        ngContent = 'ng2-content';
      }

      // our upgrade module to host the component to downgrade
      @NgModule({
        imports: [BrowserModule, UpgradeModule],
        declarations: [Ng2Component],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      // the ng1 app module that will consume the downgraded component
      const ng1Module = angular
        .module_('ng1', [])
        // create an ng1 facade of the ng2 component
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run(($rootScope: angular.IRootScopeService) => {
          $rootScope['prop'] = 'NG1';
          $rootScope['ngContent'] = 'ng1-content';
        });

      const element = html("<div>{{ 'ng1[' }}<ng2>~{{ ngContent }}~</ng2>{{ ']' }}</div>");

      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);
      expect(document.body.textContent).toEqual('ng1[NG2(~ng1-content~)]');
    });

    it('should not compile content that `ng-transclude` added to the host element', async () => {
      @Component({template: '<ng-content></ng-content>'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const ng1Module = angular
        .module_('ng1', [])
        .component('ng1', {transclude: true, template: '<ng2 ng-transclude></ng2>'})
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
            $rootScope['user'] = {
              name: 'Alice',
              avatarUrl: '/avatars/alice.png?{{ $root.evaluated() }}',
            };
          },
        ]);

      const element = html(
        '<div><ng1><img ng-src="{{ user.avatarUrl }}">{{ user.name }}</ng1></div>',
      );
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe('Alice');
    });

    it('should not compile content that a directive on the host element wrote while it was linked', async () => {
      @Component({template: '<ng-content></ng-content>'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng1Label', () => ({
          link: {
            pre: (
              scope: angular.IScope,
              element: angular.IAugmentedJQuery,
              attrs: angular.IAttributes,
            ) => (element[0].textContent = attrs['ng1Label']),
          },
        }))
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
            $rootScope['value'] = '{{ $root.evaluated() }}';
          },
        ]);

      const element = html('<div><ng2 ng1-label="{{ value }}">label</ng2></div>');
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe('label');
    });

    it('should not compile content written by a higher-priority directive controller on the host element', async () => {
      @Component({template: '[<ng-content></ng-content>]'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const texts: Record<string, string> = {
        payload: '{{ $root.evaluated() }}',
        benign: 'hello',
      };
      const ng1Module = angular
        .module_('ng1', [])
        .directive('commentText', () => ({
          restrict: 'A',
          priority: 10,
          controller: [
            '$element',
            '$attrs',
            function ($element: angular.IAugmentedJQuery, $attrs: angular.IAttributes) {
              $element[0].textContent = texts[$attrs['commentText']];
            },
          ],
        }))
        .directive('userBadge', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
          },
        ]);

      const element = html(
        '<div>' +
          '<user-badge comment-text="payload"></user-badge>' +
          '<user-badge comment-text="benign"></user-badge>' +
          '</div>',
      );
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe('[{{ $root.evaluated() }}][hello]');
    });

    it('should not compile content written by a same-priority directive controller sorted before the component', async () => {
      @Component({template: '[<ng-content></ng-content>]'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const ng1Module = angular
        .module_('ng1', [])
        // Default priority (0); 'commentText' sorts before 'userBadge' in AngularJS `byPriority`.
        .directive('commentText', () => ({
          restrict: 'A',
          controller: [
            '$element',
            function ($element: angular.IAugmentedJQuery) {
              $element[0].textContent = '{{ $root.evaluated() }}';
            },
          ],
        }))
        .directive('userBadge', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
          },
        ]);

      const element = html('<div><user-badge comment-text></user-badge></div>');
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe('[{{ $root.evaluated() }}]');
    });

    it('should not compile content written by `ng-controller` on the host element', async () => {
      @Component({template: '[<ng-content></ng-content>]'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const ng1Module = angular
        .module_('ng1', [])
        .controller('CommentCtrl', [
          '$element',
          function ($element: angular.IAugmentedJQuery) {
            $element[0].textContent = '{{ $root.evaluated() }}';
          },
        ])
        .directive('userBadge', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
          },
        ]);

      const element = html('<div><user-badge ng-controller="CommentCtrl"></user-badge></div>');
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe('[{{ $root.evaluated() }}]');
    });

    it('should not compile content written by a controller into a non-empty static template or child element', async () => {
      @Component({template: '[<ng-content></ng-content>]'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const ng1Module = angular
        .module_('ng1', [])
        .directive('mutateChild', () => ({
          restrict: 'A',
          priority: 10,
          controller: [
            '$element',
            function ($element: angular.IAugmentedJQuery) {
              const span = ($element[0] as Element).querySelector('span');
              if (span) {
                span.textContent = '{{ $root.evaluated() }}';
              } else {
                $element[0].textContent = '{{ $root.evaluated() }}';
              }
            },
          ],
        }))
        .directive('userBadge', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
            $rootScope['ok'] = 'static';
          },
        ]);

      const element = html(
        '<div>' +
          '<user-badge mutate-child><span>{{ ok }}</span></user-badge>' +
          '<user-badge mutate-child>\n  </user-badge>' +
          '</div>',
      );
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe('[static][{{ $root.evaluated() }}]');
    });

    it('should not compile content written into a descendant downgraded component by an ancestor controller or pre-link', async () => {
      @Component({template: '[<ng-content></ng-content>]'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const ng1Module = angular
        .module_('ng1', [])
        .directive('ancestorCtrl', () => ({
          restrict: 'A',
          controller: [
            '$element',
            function ($element: angular.IAugmentedJQuery) {
              ($element[0] as Element).querySelector('user-badge')!.textContent =
                '{{ $root.evaluated() }}';
            },
          ],
        }))
        .directive('ancestorPre', () => ({
          restrict: 'A',
          link: {
            pre: (_scope: angular.IScope, $element: angular.IAugmentedJQuery) => {
              ($element[0] as Element).querySelector('user-badge')!.textContent =
                '{{ $root.evaluated() }}';
            },
          },
        }))
        .directive('userBadge', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
          },
        ]);

      const element = html(
        '<div>' +
          '<div ancestor-ctrl><user-badge></user-badge></div>' +
          '<div ancestor-pre><user-badge></user-badge></div>' +
          '</div>',
      );
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe(
        '[{{ $root.evaluated() }}][{{ $root.evaluated() }}]',
      );
    });

    it('should not compile content written by controllers on nested downgraded components', async () => {
      @Component({template: 'outer(<ng-content></ng-content>)'})
      class OuterComponent {}

      @Component({template: 'inner(<ng-content></ng-content>)'})
      class InnerComponent {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const ng1Module = angular
        .module_('ng1', [])
        .directive('commentText', () => ({
          restrict: 'A',
          priority: 10,
          controller: [
            '$element',
            function ($element: angular.IAugmentedJQuery) {
              $element[0].textContent = '{{ $root.evaluated() }}';
            },
          ],
        }))
        .directive('outerMutate', () => ({
          restrict: 'A',
          priority: 10,
          controller: [
            '$element',
            function ($element: angular.IAugmentedJQuery) {
              ($element[0] as Element).querySelector('inner-ng2')!.textContent =
                '{{ $root.evaluated() }}';
            },
          ],
        }))
        .directive('outerNg2', downgradeComponent({component: OuterComponent}))
        .directive('innerNg2', downgradeComponent({component: InnerComponent}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
          },
        ]);

      const element = html(
        '<div>' +
          '<outer-ng2><inner-ng2 comment-text></inner-ng2></outer-ng2>' +
          '<outer-ng2 outer-mutate><inner-ng2></inner-ng2></outer-ng2>' +
          '</div>',
      );
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe(
        'outer(inner({{ $root.evaluated() }}))outer(inner())',
      );
    });

    it('should preserve `ng-transclude` with fallback content without double compiling', async () => {
      @Component({template: '[<ng-content></ng-content>]'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const evaluated = jasmine.createSpy('evaluated');
      const ng1Module = angular
        .module_('ng1', [])
        .component('ng1', {
          transclude: true,
          template: '<ng2 ng-transclude>fallback {{ $root.label }}</ng2>',
        })
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['evaluated'] = evaluated;
            $rootScope['label'] = 'ok';
            $rootScope['payload'] = '{{ $root.evaluated() }}';
          },
        ]);

      const element = html('<div><ng1>{{ payload }}</ng1><ng1></ng1></div>');
      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      expect(evaluated).not.toHaveBeenCalled();
      expect(multiTrim(element.textContent)).toBe('[{{ $root.evaluated() }}][fallback ok]');
    });

    it('should clone template contents fresh across repeated `ng-repeat` and toggled `ng-if` instances', async () => {
      @Component({template: '[<ng-content></ng-content>]'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run([
          '$rootScope',
          ($rootScope: angular.IRootScopeService) => {
            $rootScope['groups'] = [
              [1, 2],
              [3, 4],
            ];
            $rootScope['show'] = true;
          },
        ]);

      const element = html(
        '<div>' +
          '<ng2 ng-repeat="group in groups">' +
          '<b ng-repeat-start="i in group">{{ i }}</b><i ng-repeat-end>;</i>' +
          '</ng2>' +
          '<ng2 ng-if="show"><span ng-if="true">toggled</span></ng2>' +
          '</div>',
      );
      const upgrade = await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);
      expect(multiTrim(element.textContent)).toBe('[1;2;][3;4;][toggled]');

      $apply(upgrade, 'show = false');
      expect(multiTrim(element.textContent)).toBe('[1;2;][3;4;]');

      $apply(upgrade, 'show = true');
      expect(multiTrim(element.textContent)).toBe('[1;2;][3;4;][toggled]');
    });

    it('should correctly project structural directives', async () => {
      @Component({
        selector: 'ng2',
        template: 'ng2-{{ itemId }}(<ng-content></ng-content>)',
        standalone: false,
      })
      class Ng2Component {
        @Input() itemId: string = '';
      }

      @NgModule({
        imports: [BrowserModule, UpgradeModule],
        declarations: [Ng2Component],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run(($rootScope: angular.IRootScopeService) => {
          $rootScope['items'] = [
            {id: 'a', subitems: [1, 2, 3]},
            {id: 'b', subitems: [4, 5, 6]},
            {id: 'c', subitems: [7, 8, 9]},
          ];
        });

      const element = html(`
           <ng2 ng-repeat="item in items" [item-id]="item.id">
             <div ng-repeat="subitem in item.subitems">{{ subitem }}</div>
           </ng2>
         `);

      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);
      expect(multiTrim(document.body.textContent)).toBe('ng2-a( 123 )ng2-b( 456 )ng2-c( 789 )');
    });

    it('should project content that uses multi-element directives', async () => {
      @Component({template: '[<ng-content></ng-content>]'})
      class Ng2Component {}

      @NgModule({imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component}));

      const element = html(
        '<ng2><b ng-repeat-start="i in [1, 2]">{{ i }}</b><i ng-repeat-end>;</i></ng2>',
      );

      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);
      expect(multiTrim(element.textContent)).toBe('[1;2;]');
    });

    it('should instantiate ng1 in ng2 template and project content', async () => {
      @Component({
        selector: 'ng2',
        template: `{{ 'ng2(' }}<ng1>{{ transclude }}</ng1
          >{{ ')' }}`,
        standalone: false,
      })
      class Ng2Component {
        prop = 'ng2';
        transclude = 'ng2-transclude';
      }

      @Directive({
        selector: 'ng1',
        standalone: false,
      })
      class Ng1WrapperComponent extends UpgradeComponent {
        constructor(elementRef: ElementRef, injector: Injector) {
          super('ng1', elementRef, injector);
        }
      }

      @NgModule({
        declarations: [Ng1WrapperComponent, Ng2Component],
        imports: [BrowserModule, UpgradeModule],
      })
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng1', () => ({
          transclude: true,
          template: '{{ prop }}(<ng-transclude></ng-transclude>)',
        }))
        .directive('ng2', downgradeComponent({component: Ng2Component}))
        .run(($rootScope: angular.IRootScopeService) => {
          $rootScope['prop'] = 'ng1';
          $rootScope['transclude'] = 'ng1-transclude';
        });

      const element = html("<div>{{ 'ng1(' }}<ng2></ng2>{{ ')' }}</div>");

      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);
      expect(document.body.textContent).toEqual('ng1(ng2(ng1(ng2-transclude)))');
    });

    it('should support multi-slot projection', async () => {
      @Component({
        selector: 'ng2',
        template:
          '2a(<ng-content select=".ng1a"></ng-content>)' +
          '2b(<ng-content select=".ng1b"></ng-content>)',
        standalone: false,
      })
      class Ng2Component {
        constructor() {}
      }

      @NgModule({declarations: [Ng2Component], imports: [BrowserModule, UpgradeModule]})
      class Ng2Module {
        ngDoBootstrap() {}
      }

      const ng1Module = angular
        .module_('ng1', [])
        .directive('ng2', downgradeComponent({component: Ng2Component}));

      // The ng-if on one of the projected children is here to make sure
      // the correct slot is targeted even with structural directives in play.
      const element = html(
        '<ng2><div ng-if="true" class="ng1a">1a</div><div' + ' class="ng1b">1b</div></ng2>',
      );

      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);
      expect(document.body.textContent).toEqual('2a(1a)2b(1b)');
    });
  });
});
