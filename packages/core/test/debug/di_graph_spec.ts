/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  createComponent,
  createEnvironmentInjector,
  destroyPlatform,
  Directive,
  Injectable,
  InjectionToken,
} from '@angular/core';
import {bootstrapApplication, createApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';
import {diGraphTool} from '../../src/debug/ai/di_graph';
import {setupFrameworkInjectorProfiler} from '../../src/render3/debug/framework_injector_profiler';

describe('diGraphTool', () => {
  beforeEach(() => {
    destroyPlatform();
    setupFrameworkInjectorProfiler();
  });
  afterEach(() => void destroyPlatform());

  it(
    'should discover element injectors',
    withBody('<test-cmp></test-cmp>', async () => {
      @Injectable()
      class CustomService {}

      @Component({
        selector: 'test-cmp',
        template: '<div>Root</div>',
        providers: [CustomService],
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const result = await diGraphTool.execute({});

        expect(result.elementInjectorRoots).toEqual([
          jasmine.objectContaining({
            type: 'element',
            providers: [
              {
                token: CustomService,
                value: jasmine.any(CustomService),
              },
            ],
            viewProviders: [],
            children: [],
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should build hierarchical tree of element injectors with root component',
    withBody('<test-cmp></test-cmp>', async () => {
      @Injectable()
      class DirectiveService {}

      @Directive({
        selector: '[custom-dir]',
        providers: [DirectiveService],
      })
      class CustomDir {}

      @Injectable()
      class ComponentService {}

      @Component({
        selector: 'test-cmp',
        template: '<div custom-dir>Root</div>',
        imports: [CustomDir],
        providers: [ComponentService],
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const result = await diGraphTool.execute({});

        expect(result.elementInjectorRoots).toEqual([
          jasmine.objectContaining({
            type: 'element',
            providers: [
              {
                token: ComponentService,
                value: jasmine.any(ComponentService),
              },
            ],
            children: [
              jasmine.objectContaining({
                type: 'element',
                providers: [
                  {
                    token: DirectiveService,
                    value: jasmine.any(DirectiveService),
                  },
                ],
                children: [],
              }),
            ],
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should discover ancestor environment injectors',
    withBody('<test-cmp></test-cmp>', async () => {
      @Injectable()
      class EnvService {}

      @Component({
        selector: 'test-cmp',
        template: '<div>Root</div>',
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp, {
        providers: [EnvService],
      });
      try {
        const result = await diGraphTool.execute({});

        expect(result.environmentInjectorRoot).toEqual(
          jasmine.objectContaining({
            name: 'Null Injector',
            children: jasmine.arrayContaining([
              jasmine.objectContaining({
                name: 'R3Injector', // Platform
                children: jasmine.arrayContaining([
                  jasmine.objectContaining({
                    name: 'Environment Injector', // Root
                    providers: jasmine.arrayContaining([
                      {token: EnvService, value: jasmine.any(EnvService)},
                    ]),
                  }),
                ]),
              }),
            ]),
          }),
        );
      } finally {
        appRef.destroy();
      }
    }),
  );
  it(
    'should discover element injectors from multiple roots',
    withBody('<app-root-1></app-root-1><app-root-2></app-root-2>', async () => {
      @Injectable()
      class Service1 {}

      @Component({
        selector: 'app-root-1',
        template: '<div>Root 1</div>',
        providers: [Service1],
      })
      class AppRoot1 {}

      @Injectable()
      class Service2 {}

      @Component({
        selector: 'app-root-2',
        template: '<div>Root 2</div>',
        providers: [Service2],
      })
      class AppRoot2 {}

      const appRef = await createApplication();
      appRef.bootstrap(AppRoot1);
      appRef.bootstrap(AppRoot2);

      try {
        const result = await diGraphTool.execute({});

        expect(result.elementInjectorRoots).toEqual([
          jasmine.objectContaining({
            providers: [{token: Service1, value: jasmine.any(Service1)}],
          }),
          jasmine.objectContaining({
            providers: [{token: Service2, value: jasmine.any(Service2)}],
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should handle content projection',
    withBody('<test-cmp></test-cmp>', async () => {
      @Injectable()
      class ProjectorService {}

      @Component({
        selector: 'projector',
        template: '<ng-content></ng-content>',
        providers: [ProjectorService],
      })
      class ProjectorCmp {}

      @Injectable()
      class ChildService {}

      @Directive({
        selector: '[child-dir]',
        providers: [ChildService],
      })
      class ChildDir {}

      @Injectable()
      class TestService {}

      @Component({
        selector: 'test-cmp',
        template: '<projector><div child-dir></div></projector>',
        imports: [ProjectorCmp, ChildDir],
        providers: [TestService],
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const result = await diGraphTool.execute({});

        expect(result.elementInjectorRoots).toEqual([
          jasmine.objectContaining({
            providers: jasmine.arrayWithExactContents([
              {
                token: TestService,
                value: jasmine.any(TestService),
              },
            ]),
            children: [
              jasmine.objectContaining({
                providers: jasmine.arrayWithExactContents([
                  {
                    token: ProjectorService,
                    value: jasmine.any(ProjectorService),
                  },
                ]),
                children: [
                  jasmine.objectContaining({
                    type: 'element',
                    providers: jasmine.arrayWithExactContents([
                      {
                        token: ChildService,
                        value: jasmine.any(ChildService),
                      },
                    ]),
                  }),
                ],
              }),
            ],
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should handle embedded views (`@if`)',
    withBody('<test-cmp></test-cmp>', async () => {
      @Injectable()
      class DirectiveService {}

      @Directive({
        selector: '[child-dir]',
        providers: [DirectiveService],
      })
      class ChildDir {}

      @Injectable()
      class ComponentService {}

      @Component({
        selector: 'test-cmp',
        template: '@if (true) { <div child-dir></div> }',
        imports: [ChildDir],
        providers: [ComponentService],
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const result = await diGraphTool.execute({});

        expect(result.elementInjectorRoots).toEqual([
          jasmine.objectContaining({
            providers: [
              {
                token: ComponentService,
                value: jasmine.any(ComponentService),
              },
            ],
            children: [
              jasmine.objectContaining({
                type: 'element',
                providers: [
                  {
                    token: DirectiveService,
                    value: jasmine.any(DirectiveService),
                  },
                ],
              }),
            ],
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should handle host directives',
    withBody('<test-cmp></test-cmp>', async () => {
      @Injectable()
      class HostService {}

      @Directive({
        selector: '[host-dir]',
        providers: [HostService],
      })
      class HostDir {}

      @Injectable()
      class TestService {}

      @Component({
        selector: 'test-cmp',
        template: '<div>Root</div>',
        hostDirectives: [HostDir],
        providers: [TestService],
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const result = await diGraphTool.execute({});

        expect(result.elementInjectorRoots).toEqual([
          // Components and host directives share the same `Injector`.
          jasmine.objectContaining({
            providers: jasmine.arrayWithExactContents([
              {
                token: HostService,
                value: jasmine.any(HostService),
              },
              {
                token: TestService,
                value: jasmine.any(TestService),
              },
            ]),
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should handle view providers',
    withBody('<test-cmp></test-cmp>', async () => {
      @Injectable()
      class TestService {}

      @Injectable()
      class ViewService {}

      @Component({
        selector: 'test-cmp',
        template: '<div>Root</div>',
        providers: [TestService],
        viewProviders: [ViewService],
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const result = await diGraphTool.execute({});

        expect(result.elementInjectorRoots).toEqual([
          jasmine.objectContaining({
            providers: [
              {
                token: TestService,
                value: jasmine.any(TestService),
              },
            ],
            viewProviders: [
              {
                token: ViewService,
                value: jasmine.any(ViewService),
              },
            ],
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should handle dynamically created root components',
    withBody('<test-cmp></test-cmp><div id="dynamic-host"></div>', async () => {
      @Injectable()
      class DynamicService {}

      @Component({
        selector: 'dynamic-cmp',
        template: '<div>Dynamic</div>',
        providers: [DynamicService],
      })
      class DynamicCmp {}

      @Injectable()
      class TestService {}

      @Component({
        selector: 'test-cmp',
        template: '<div>Root</div>',
        providers: [TestService],
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const hostEl = document.getElementById('dynamic-host')!;

        // Use createComponent with hostElement!
        createComponent(DynamicCmp, {
          environmentInjector: appRef.injector,
          hostElement: hostEl,
        });

        const result = await diGraphTool.execute({});
        expect(result.elementInjectorRoots).toEqual([
          jasmine.objectContaining({
            providers: [{token: TestService, value: jasmine.any(TestService)}],
          }),
          jasmine.objectContaining({
            providers: [{token: DynamicService, value: jasmine.any(DynamicService)}],
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );
  it(
    'should handle custom environment injectors with `createComponent`',
    withBody('<test-cmp></test-cmp><div id="dynamic-host"></div>', async () => {
      @Component({
        selector: 'dynamic-cmp',
        template: '<div>Dynamic</div>',
      })
      class DynamicCmp {}

      @Component({
        selector: 'test-cmp',
        template: '<div>Root</div>',
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const hostEl = document.getElementById('dynamic-host')!;

        // Create custom environment injector!
        const customEnv = createEnvironmentInjector([], appRef.injector);

        // NOTE: We cannot assert on the providers array here because manually created
        // environment injectors bypass the profiler hooks that populate the providers
        // manifest. However, we CAN assert that the injector itself was found and
        // mapped into the hierarchy by searching the tree for its name.
        const CustomConstructor = function () {};
        Object.defineProperty(CustomConstructor, 'name', {value: 'CustomEnvInjector'});
        (customEnv as any).constructor = CustomConstructor;

        // Use createComponent with custom environment injector!
        createComponent(DynamicCmp, {
          environmentInjector: customEnv,
          hostElement: hostEl,
        });

        const result = await diGraphTool.execute({});

        expect(result.environmentInjectorRoot).toEqual(
          jasmine.objectContaining({
            name: 'Null Injector',
            children: [
              jasmine.objectContaining({
                name: 'R3Injector', // Platform
                children: [
                  jasmine.objectContaining({
                    name: 'Environment Injector', // Root
                    children: jasmine.arrayContaining([
                      jasmine.objectContaining({
                        name: 'CustomEnvInjector',
                        type: 'environment',
                      }),
                    ]),
                  }),
                ],
              }),
            ],
          }),
        );
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should handle multi-providers',
    withBody('<test-cmp></test-cmp>', async () => {
      const multiToken = new InjectionToken<string[]>('MULTI_TOKEN');

      @Component({
        selector: 'test-cmp',
        template: '<div>Root</div>',
        providers: [
          {provide: multiToken, useValue: 'val1', multi: true},
          {provide: multiToken, useValue: 'val2', multi: true},
        ],
      })
      class TestCmp {}

      const appRef = await bootstrapApplication(TestCmp);
      try {
        const result = await diGraphTool.execute({});

        expect(result.elementInjectorRoots).toEqual([
          jasmine.objectContaining({
            // There should only be one `multiToken`, but the framework profiler currently records
            // multi-providers once per configuration rather than aggregating them by token. This
            // causes them to appear multiple times in the providers array.
            providers: [
              {token: multiToken, value: ['val1', 'val2']},
              {token: multiToken, value: ['val1', 'val2']},
            ],
          }),
        ]);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should handle siblings with directives',
    withBody('<test-comp-1></test-comp-1>', async () => {
      @Directive({
        selector: '[dir-a]',
        standalone: true,
      })
      class DirA {}

      @Directive({
        selector: '[dir-b]',
        standalone: true,
      })
      class DirB {}

      @Component({
        selector: 'test-comp-1',
        template: '<div dir-a></div><div dir-b></div>',
        imports: [DirA, DirB],
        standalone: true,
      })
      class TestComponent1 {}

      const appRef = await bootstrapApplication(TestComponent1);
      try {
        const result = await diGraphTool.execute({});

        // TestComponent should have two children
        expect(result.elementInjectorRoots[0].children.length).toBe(2);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should handle siblings with directives inside @if',
    withBody('<test-comp-2></test-comp-2>', async () => {
      @Directive({
        selector: '[dir-a]',
        standalone: true,
      })
      class DirA {}

      @Directive({
        selector: '[dir-b]',
        standalone: true,
      })
      class DirB {}

      @Component({
        selector: 'test-comp-2',
        template: ' @if (true) { <div dir-a></div><div dir-b></div> }',
        imports: [DirA, DirB],
        standalone: true,
      })
      class TestComponent2 {}

      const appRef = await bootstrapApplication(TestComponent2);
      try {
        const result = await diGraphTool.execute({});

        // TestComponent should have two children
        expect(result.elementInjectorRoots[0].children.length).toBe(2);
      } finally {
        appRef.destroy();
      }
    }),
  );

  it(
    'should throw an error if a root is not an Angular component',
    withBody('<div ng-version="fake"></div>', async () => {
      await expectAsync(diGraphTool.execute({})).toBeRejectedWithError(
        /Could not find an `LView` for root `<div>`, is it an Angular component\?/,
      );
    }),
  );
});
