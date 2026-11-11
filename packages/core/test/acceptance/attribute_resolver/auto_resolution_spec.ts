/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  BoundClassResolver,
  ClassResolver,
  Component,
  createComponent,
  createEnvironmentInjector,
  Directive,
  EnvironmentInjector,
  inject,
  lastValue,
  provideAttributeResolvers,
  Provider,
  Renderer2,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  withAutoResolution,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';

import {classesOf, cn, describeOffSubtree} from './off_subtree_cases';

// A component caches its `TView`, so every spec here declares its own components and provides
// `withAutoResolution()` before it renders.
describe('automatic resolution', () => {
  function recordingResolver() {
    return jasmine.createSpy<ClassResolver>('resolver').and.callFake(cn);
  }

  function callsWith(resolver: jasmine.Spy<ClassResolver>, className: string): string[][] {
    return resolver.calls
      .allArgs()
      .filter((classes) => classes.join(' ').split(' ').includes(className));
  }

  it('resolves a component host and an element with a directive, but not a plain element', async () => {
    @Component({selector: 'ui-button', template: '', host: {class: 'bg-primary px-2'}})
    class UiButton {}

    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      imports: [UiButton, Tone],
      template: `<ui-button class="px-4" />
        <div tone class="px-4"></div>
        <span class="px-2 px-4"></span>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual([
      'bg-primary',
      'px-4',
    ]);
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['px-4']);
    expect(classesOf(fixture.nativeElement.querySelector('span'))).toEqual(['px-2', 'px-4']);
  });

  it('takes [attr.class] as a source without writing the whole attribute', async () => {
    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({imports: [Tone], template: `<div tone [attr.class]="names()"></div>`})
    class App {
      readonly names = signal('px-4 a');
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(classesOf(div)).toEqual(['a', 'px-4']);

    fixture.debugElement.injector.get(Renderer2).addClass(div, 'outside');
    fixture.componentInstance.names.set('px-6');
    await fixture.whenStable();

    expect(classesOf(div)).toEqual(['outside', 'px-6']);
  });

  it('resolves an element without class sources once, apart from an element shown later', async () => {
    const resolver = jasmine
      .createSpy<ClassResolver>('resolver')
      .and.callFake((...classes) => cn(...classes, 'resolved'));

    @Directive({selector: '[tone]'})
    class Tone {}

    @Component({
      imports: [Tone],
      template: `<div tone></div>
        @if (shown()) {
          <span tone [class]="names()"></span>
        }`,
    })
    class App {
      readonly shown = signal(false);
      readonly names = signal('px-2');
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');

    // The root component's host has no class sources either.
    expect(classesOf(div)).toEqual(['resolved']);
    expect(resolver.calls.allArgs()).toEqual([[], []]);

    fixture.componentInstance.shown.set(true);
    await fixture.whenStable();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');

    expect(classesOf(span)).toEqual(['px-2', 'resolved']);
    expect(resolver.calls.allArgs()).toEqual([[], [], ['px-2']]);

    fixture.componentInstance.names.set('px-4');
    await fixture.whenStable();

    expect(classesOf(span)).toEqual(['px-4', 'resolved']);
    expect(classesOf(div)).toEqual(['resolved']);
    expect(resolver.calls.allArgs()).toEqual([[], [], ['px-2'], ['px-4']]);
  });

  it('keeps the resolvers that the provider was created with when the map changes later', async () => {
    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      imports: [Tone],
      template: `<div tone class="px-4"></div>
        <span class="px-4" (class)="(cn) => cn()"></span>`,
    })
    class App {}

    const resolvers: {class: ClassResolver} = {
      class: (...classes) => cn(...classes, 'by-original'),
    };
    const providers = provideAttributeResolvers(resolvers, withAutoResolution());
    resolvers.class = (...classes) => cn(...classes, 'by-changed');

    TestBed.configureTestingModule({providers: [providers]});
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['by-original', 'px-4']);
    expect(classesOf(fixture.nativeElement.querySelector('span'))).toEqual(['by-original', 'px-4']);
  });

  it('resolves nothing in an app whose root providers have no class resolver', async () => {
    withAutoResolution();

    @Component({selector: 'ui-button', template: '', host: {class: 'bg-primary px-2'}})
    class UiButton {}

    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      imports: [UiButton, Tone],
      template: `<ui-button class="px-4" />
        <div tone class="px-4"></div>`,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual([
      'bg-primary',
      'px-2',
      'px-4',
    ]);
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['px-2', 'px-4']);
  });

  it('turns off in a component that provides withAutoResolution(false), and back on below it', async () => {
    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      selector: 'modern-card',
      imports: [Tone],
      template: `<div id="modern" tone class="px-4"></div>`,
      viewProviders: [provideAttributeResolvers({class: cn}, withAutoResolution())],
    })
    class ModernCard {}

    @Component({
      selector: 'other-card',
      imports: [Tone],
      template: `<div id="other" tone class="px-4"></div>`,
      viewProviders: [
        provideAttributeResolvers({class: (...classes) => cn(...classes, 'by-other')}),
      ],
    })
    class OtherCard {}

    @Component({
      selector: 'legacy-table',
      imports: [Tone, ModernCard, OtherCard],
      template: `
        <div id="legacy" tone class="px-4"></div>
        @if (true) {
          <div id="legacy-nested" tone class="px-4"></div>
        }
        <modern-card tone class="px-4" />
        <other-card />
      `,
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution(false))],
    })
    class LegacyTable {}

    @Component({
      imports: [Tone, LegacyTable],
      template: `
        <legacy-table id="table" tone class="px-4" />
        @if (true) {
          <div id="app-nested" tone class="px-4"></div>
        }
      `,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = (selector: string) => fixture.nativeElement.querySelector(selector) as Element;

    expect(classesOf(element('#table'))).toEqual(['px-4']);
    expect(classesOf(element('#app-nested'))).toEqual(['px-4']);
    expect(classesOf(element('#legacy'))).toEqual(['px-2', 'px-4']);
    expect(classesOf(element('#legacy-nested'))).toEqual(['px-2', 'px-4']);
    expect(classesOf(element('modern-card'))).toEqual(['px-2', 'px-4']);
    expect(classesOf(element('#modern'))).toEqual(['px-4']);
    expect(classesOf(element('#other'))).toEqual(['px-2', 'px-4']);
  });

  describe('in a component that provides resolvers', () => {
    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    function appWith(providers: Provider[]) {
      @Component({
        selector: 'ui-panel',
        imports: [Tone],
        template: `<div id="auto" tone class="px-4"></div>
          <span id="explicit" class="px-2" (class)="(cn) => cn('px-4')"></span>`,
        providers,
      })
      class UiPanel {}

      @Component({imports: [UiPanel], template: '<ui-panel />'})
      class App {}
      return App;
    }

    it("keeps the root's class resolver and setting when its map doesn't name class", async () => {
      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
      });
      const fixture = TestBed.createComponent(
        appWith([provideAttributeResolvers({role: lastValue})]),
      );
      await fixture.whenStable();

      expect(classesOf(fixture.nativeElement.querySelector('#auto'))).toEqual(['px-4']);
      expect(classesOf(fixture.nativeElement.querySelector('#explicit'))).toEqual(['px-4']);
    });

    it('keeps it on with its own class resolver when its map names class without it', async () => {
      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
      });
      const fixture = TestBed.createComponent(
        appWith([
          provideAttributeResolvers({class: (...classes) => [...classes, 'by-other'].join(' ')}),
        ]),
      );
      await fixture.whenStable();

      expect(classesOf(fixture.nativeElement.querySelector('#auto'))).toEqual([
        'by-other',
        'px-2',
        'px-4',
      ]);
      expect(classesOf(fixture.nativeElement.querySelector('#explicit'))).toEqual([
        'by-other',
        'px-2',
        'px-4',
      ]);
    });
  });

  describe('in a component inserted with its own environment injector', () => {
    const rootCn = (...classes: string[]) => cn(...classes, 'by-root');
    const routeCn = (...classes: string[]) => cn(...classes, 'by-route');

    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      selector: 'app-page',
      imports: [Tone],
      template: `<div id="title" title="raw" (attr.title)="$event.resolve($event.resolver())"></div>
        <div id="auto" tone class="px-4"></div>`,
      host: {class: 'px-2 px-4'},
    })
    class Page {}

    function expectRouteResolvers(page: Element) {
      expect(page.querySelector('#title')!.getAttribute('title')).toBe('route-title');
      expect(classesOf(page)).toEqual(['by-route', 'px-4']);
      expect(classesOf(page.querySelector('#auto')!)).toEqual(['by-route', 'px-4']);
    }

    it("takes a lazy route's resolvers over those of the component that hosts the outlet", async () => {
      @Component({
        imports: [RouterOutlet],
        template: '<router-outlet />',
        providers: [provideAttributeResolvers({role: lastValue})],
      })
      class App {}

      TestBed.configureTestingModule({
        providers: [
          provideAttributeResolvers({class: rootCn}, withAutoResolution()),
          provideRouter([
            {
              path: 'lazy',
              providers: [provideAttributeResolvers({class: routeCn, title: () => 'route-title'})],
              loadChildren: () => [{path: '', component: Page}],
            },
          ]),
        ],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(await TestBed.inject(Router).navigateByUrl('/lazy')).toBe(true);
      await fixture.whenStable();

      expectRouteResolvers(fixture.nativeElement.querySelector('app-page'));
    });

    it("takes the resolvers of createComponent()'s environment injector over those of the view container's component", async () => {
      @Component({
        template: '<ng-container #slot />',
        providers: [provideAttributeResolvers({role: lastValue})],
      })
      class App {
        @ViewChild('slot', {read: ViewContainerRef, static: true}) slot!: ViewContainerRef;
      }

      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({class: rootCn}, withAutoResolution())],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const environmentInjector = createEnvironmentInjector(
        [provideAttributeResolvers({class: routeCn, title: () => 'route-title'})],
        TestBed.inject(EnvironmentInjector),
      );

      const page = fixture.componentInstance.slot.createComponent(Page, {environmentInjector});
      await fixture.whenStable();

      expectRouteResolvers(page.location.nativeElement);
    });
  });

  it('splits classes with the plain merge the way a class resolver binding does', async () => {
    @Directive({selector: '[tone]', host: {'[attr.class]': 'names'}})
    class Tone {
      readonly names = 'a\u00a0b\u000bc\u2003d e';
    }

    @Component({
      imports: [Tone],
      template: `<div tone id="auto"></div>
        <div tone id="bound" (attr.class)="$event.resolve($event.resolver())"></div>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement.querySelector('#auto'))).toEqual(
      classesOf(fixture.nativeElement.querySelector('#bound')),
    );
  });

  it('resolves classes with the plain merge when the root map has no class resolver', async () => {
    @Directive({selector: '[tone]', host: {class: 'px-2 tone', '[class.raised]': 'raised()'}})
    class Tone {
      readonly raised = signal(true);
    }

    @Component({
      imports: [Tone],
      template: `<div tone class="px-4 tone" [class.active]="active()"></div>`,
    })
    class App {
      readonly active = signal(false);
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const div = fixture.nativeElement.querySelector('div');
    const tone = fixture.debugElement.children[0].injector.get(Tone);

    expect(classesOf(div)).toEqual(['px-2', 'px-4', 'raised', 'tone']);

    fixture.componentInstance.active.set(true);
    tone.raised.set(false);
    await fixture.whenStable();

    expect(classesOf(div)).toEqual(['active', 'px-2', 'px-4', 'tone']);
  });

  it('resolves the instances of a template where it is on after the first instance was created where it is off', async () => {
    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({selector: 'ui-card', imports: [Tone], template: `<div tone class="px-4"></div>`})
    class UiCard {}

    @Component({
      selector: 'legacy-panel',
      imports: [UiCard],
      template: `<ui-card />`,
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution(false))],
    })
    class LegacyPanel {}

    @Component({
      imports: [LegacyPanel, UiCard],
      template: `<legacy-panel /><ui-card id="modern" />`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement.querySelector('legacy-panel div'))).toEqual([
      'px-2',
      'px-4',
    ]);
    expect(classesOf(fixture.nativeElement.querySelector('#modern div'))).toEqual(['px-4']);
  });

  it('resolves a routed component and its host directives', async () => {
    @Directive({selector: '[elevated]', host: {class: 'shadow-sm'}})
    class Elevated {}

    @Component({
      selector: 'app-page',
      template: '',
      host: {class: 'px-2 shadow-lg'},
      hostDirectives: [Elevated],
    })
    class Page {}

    @Component({imports: [RouterOutlet], template: '<router-outlet />'})
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({class: cn}, withAutoResolution()),
        provideRouter([{path: '', component: Page}]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement.querySelector('app-page'))).toEqual([
      'px-2',
      'shadow-lg',
    ]);
  });

  it('resolves a component created in code with the setting where it is inserted', async () => {
    @Component({selector: 'app-badge', template: '', host: {class: 'px-2 px-4'}})
    class Badge {}

    @Component({
      selector: 'legacy-host',
      template: '<ng-container #slot />',
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution(false))],
    })
    class LegacyHost {
      @ViewChild('slot', {read: ViewContainerRef, static: true}) slot!: ViewContainerRef;
    }

    @Component({imports: [LegacyHost], template: '<legacy-host />'})
    class App {
      readonly viewContainer = inject(ViewContainerRef);
      @ViewChild(LegacyHost, {static: true}) legacyHost!: LegacyHost;
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const resolved = fixture.componentInstance.viewContainer.createComponent(Badge);
    const notResolved = fixture.componentInstance.legacyHost.slot.createComponent(Badge);
    await fixture.whenStable();

    expect(classesOf(resolved.location.nativeElement)).toEqual(['px-4']);
    expect(classesOf(notResolved.location.nativeElement)).toEqual(['px-2', 'px-4']);
  });

  it('resolves a component created with createComponent() and attached to the application, with its host directives', async () => {
    const resolver = recordingResolver();

    @Directive({host: {class: 'shadow-sm'}})
    class Elevated {}

    @Component({
      template: '',
      host: {class: 'px-2 px-4', '[class.active]': 'active()'},
      hostDirectives: [Elevated],
    })
    class Badge {
      readonly active = signal(false);
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    });
    const appRef = TestBed.inject(ApplicationRef);
    const badge = createComponent(Badge, {
      environmentInjector: TestBed.inject(EnvironmentInjector),
    });
    appRef.attachView(badge.hostView);
    await appRef.whenStable();

    expect(resolver.calls.allArgs()).toEqual([['shadow-sm', 'px-2', 'px-4']]);
    expect(classesOf(badge.location.nativeElement)).toEqual(['px-4', 'shadow-sm']);

    badge.instance.active.set(true);
    await appRef.whenStable();

    expect(resolver.calls.allArgs()).toEqual([
      ['shadow-sm', 'px-2', 'px-4'],
      ['shadow-sm', 'px-2', 'px-4', 'active'],
    ]);
    expect(classesOf(badge.location.nativeElement)).toEqual(['active', 'px-4', 'shadow-sm']);
  });

  it('resolves an embedded view with the setting where its template is declared, wherever it is inserted', async () => {
    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      selector: 'legacy-panel',
      imports: [Tone],
      template: `
        <ng-template #template><div id="legacy" tone [class]="classes()"></div></ng-template>
        <ng-container #slot />
      `,
      providers: [
        provideAttributeResolvers(
          {class: (...classes) => cn(...classes, 'by-legacy')},
          withAutoResolution(false),
        ),
      ],
    })
    class LegacyPanel {
      readonly classes = signal('px-4');
      @ViewChild('template', {static: true}) template!: TemplateRef<unknown>;
      @ViewChild('slot', {read: ViewContainerRef, static: true}) slot!: ViewContainerRef;
    }

    @Component({
      imports: [Tone, LegacyPanel],
      template: `
        <ng-template #template><div id="modern" tone [class]="classes()"></div></ng-template>
        <ng-container #slot />
        <legacy-panel />
      `,
    })
    class App {
      readonly classes = signal('px-4');
      @ViewChild('template', {static: true}) template!: TemplateRef<unknown>;
      @ViewChild('slot', {read: ViewContainerRef, static: true}) slot!: ViewContainerRef;
      @ViewChild(LegacyPanel, {static: true}) legacy!: LegacyPanel;
    }

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers(
          {class: (...classes) => cn(...classes, 'by-root')},
          withAutoResolution(),
        ),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;
    app.legacy.slot.createEmbeddedView(app.template);
    app.slot.createEmbeddedView(app.legacy.template);
    await fixture.whenStable();
    const modern = fixture.nativeElement.querySelector('#modern');
    const legacy = fixture.nativeElement.querySelector('#legacy');

    expect(classesOf(modern)).toEqual(['by-root', 'px-4']);
    expect(classesOf(legacy)).toEqual(['px-2', 'px-4']);

    app.classes.set('px-6');
    app.legacy.classes.set('px-8');
    await fixture.whenStable();

    expect(classesOf(modern)).toEqual(['by-root', 'px-6']);
    expect(classesOf(legacy)).toEqual(['px-2', 'px-8']);
  });

  it('reports NG0322 when a lazy route turns it on and the root providers do not', async () => {
    @Component({selector: 'app-page', template: ''})
    class Page {}

    @Component({imports: [RouterOutlet], template: '<router-outlet />'})
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({class: cn}),
        provideRouter([
          {
            path: 'lazy',
            providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
            loadChildren: () => [{path: '', component: Page}],
          },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    await expectAsync(TestBed.inject(Router).navigateByUrl('/lazy')).toBeRejectedWithError(
      /^NG0322: /,
    );
  });

  it('reports NG0322 when a component turns it on and the root providers turn it off', () => {
    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      selector: 'modern-card',
      imports: [Tone],
      template: `<div tone class="px-4"></div>`,
      providers: [provideAttributeResolvers({}, withAutoResolution())],
    })
    class ModernCard {}

    @Component({imports: [ModernCard], template: '<modern-card />'})
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution(false))],
    });

    expect(() => TestBed.createComponent(App)).toThrowError(/^NG0322: /);
  });

  it('reports NG0322 when a component turns it on and the root providers have no class resolver', () => {
    const resolver = recordingResolver();

    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      selector: 'modern-card',
      imports: [Tone],
      template: `<div tone class="px-4"></div>`,
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    })
    class ModernCard {}

    @Component({imports: [ModernCard], template: '<modern-card />'})
    class App {}

    expect(() => TestBed.createComponent(App)).toThrowError(/^NG0322: /);
    expect(resolver).not.toHaveBeenCalled();
  });

  it('resolves an element with a (class) binding only through that binding', async () => {
    const resolver = recordingResolver();

    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      imports: [Tone],
      template: `<div tone class="px-4" (class)="(cn) => cn('shadow-lg')"></div>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(callsWith(resolver, 'px-4')).toEqual([['px-2', 'px-4', 'shadow-lg']]);
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['px-4', 'shadow-lg']);
  });

  it("resolves an element whose directive's host binding registers a resolver only through it", async () => {
    const resolver = recordingResolver();

    @Directive({selector: '[elevated]', host: {'class': 'px-2', '(class)': 'resolve'}})
    class Elevated {
      protected readonly resolve = (cn: BoundClassResolver) => cn('shadow-lg');
    }

    @Component({imports: [Elevated], template: `<div elevated class="px-4"></div>`})
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(callsWith(resolver, 'px-4')).toEqual([['px-2', 'shadow-lg', 'px-4']]);
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['px-4', 'shadow-lg']);
  });

  it('passes the resolver one argument per class, in priority order', async () => {
    const resolver = recordingResolver();

    @Component({selector: 'ui-card', template: '', host: {class: 'px-4 py-2'}})
    class UiCard {}

    @Component({imports: [UiCard], template: `<ui-card class="px-2" />`})
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(callsWith(resolver, 'px-2')).toEqual([['px-4', 'py-2', 'px-2']]);
    expect(classesOf(fixture.nativeElement.querySelector('ui-card'))).toEqual(['px-2', 'py-2']);
  });

  it('passes the resolver no argument for an empty static class', async () => {
    const resolver = recordingResolver();

    @Component({selector: 'ui-card', template: '', host: {class: ''}})
    class UiCard {}

    @Directive({selector: '[tooltip]', host: {class: 'px-2'}})
    class Tooltip {}

    @Component({imports: [UiCard, Tooltip], template: `<ui-card tooltip class="" />`})
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(callsWith(resolver, 'px-2')).toEqual([['px-2']]);
  });

  it('passes the resolver one argument per class of a binding whose name contains a space', async () => {
    const resolver = recordingResolver();
    const joined = signal(true);

    @Component({
      selector: 'ui-card',
      template: '',
      host: {'[class.a b]': 'joined()', '[class.a]': '!joined()', '[class.b]': '!joined()'},
    })
    class UiCard {
      protected readonly joined = joined;
    }

    @Component({imports: [UiCard], template: `<ui-card />`})
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const card = fixture.nativeElement.querySelector('ui-card');

    expect(callsWith(resolver, 'a')).toEqual([['a', 'b']]);
    expect(classesOf(card)).toEqual(['a', 'b']);

    joined.set(false);
    await fixture.whenStable();

    expect(callsWith(resolver, 'a')).toEqual([['a', 'b']]);
    expect(classesOf(card)).toEqual(['a', 'b']);
  });

  it('calls the resolver again only when the classes of a source change', async () => {
    const resolver = recordingResolver();

    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      imports: [Tone],
      template: `<div tone class="px-4" [class.active]="active()"></div>
        {{ count() }}`,
    })
    class App {
      readonly active = signal(false);
      readonly count = signal(0);
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(callsWith(resolver, 'px-4')).toEqual([['px-2', 'px-4']]);

    fixture.componentInstance.count.set(1);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('1');
    expect(callsWith(resolver, 'px-4')).toEqual([['px-2', 'px-4']]);

    fixture.componentInstance.active.set(true);
    await fixture.whenStable();

    expect(callsWith(resolver, 'px-4')).toEqual([
      ['px-2', 'px-4'],
      ['px-2', 'px-4', 'active'],
    ]);
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['active', 'px-4']);
  });

  it('resolves a lazy route that turns it on again with its own resolver when the root providers declare it', async () => {
    @Component({selector: 'app-page', template: '', host: {class: 'px-2 px-4'}})
    class Page {}

    @Component({imports: [RouterOutlet], template: '<router-outlet />'})
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({class: cn}, withAutoResolution()),
        provideRouter([
          {
            path: 'lazy',
            providers: [
              provideAttributeResolvers(
                {class: (...classes) => cn(...classes, 'by-route')},
                withAutoResolution(),
              ),
            ],
            loadChildren: () => [{path: '', component: Page}],
          },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(await TestBed.inject(Router).navigateByUrl('/lazy')).toBe(true);
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement.querySelector('app-page'))).toEqual([
      'by-route',
      'px-4',
    ]);
  });

  describe('in production mode', () => {
    const _global = globalThis as unknown as {ngDevMode: unknown};
    let savedNgDevMode: unknown;
    beforeEach(() => (savedNgDevMode = _global.ngDevMode));
    afterEach(() => (_global.ngDevMode = savedNgDevMode));

    it('ignores a lazy route that turns it on when the root providers do not', async () => {
      _global.ngDevMode = false;

      @Directive({selector: '[tone]', host: {class: 'px-2'}})
      class Tone {}

      @Component({
        selector: 'app-page',
        imports: [Tone],
        template: `<div tone class="px-4"></div>`,
        host: {class: 'px-2 px-4'},
      })
      class Page {}

      @Component({imports: [RouterOutlet], template: '<router-outlet />'})
      class App {}

      TestBed.configureTestingModule({
        providers: [
          provideAttributeResolvers({class: cn}),
          provideRouter([
            {
              path: 'lazy',
              providers: [provideAttributeResolvers({class: cn}, withAutoResolution())],
              loadChildren: () => [{path: '', component: Page}],
            },
          ]),
        ],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(await TestBed.inject(Router).navigateByUrl('/lazy')).toBe(true);
      await fixture.whenStable();

      expect(classesOf(fixture.nativeElement.querySelector('app-page'))).toEqual(['px-2', 'px-4']);
      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['px-2', 'px-4']);
    });

    it('ignores a component that turns it on when the root providers have no class resolver', async () => {
      _global.ngDevMode = false;
      const resolver = recordingResolver();

      @Directive({selector: '[tone]', host: {class: 'px-2'}})
      class Tone {}

      @Component({
        selector: 'modern-card',
        imports: [Tone],
        template: `<div tone class="px-4" [class.active]="active()"></div>`,
        providers: [provideAttributeResolvers({class: resolver}, withAutoResolution())],
      })
      class ModernCard {
        readonly active = signal(false);
      }

      @Component({imports: [ModernCard], template: '<modern-card />'})
      class App {
        @ViewChild(ModernCard, {static: true}) card!: ModernCard;
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const div = fixture.nativeElement.querySelector('div');
      expect(classesOf(div)).toEqual(['px-2', 'px-4']);

      fixture.componentInstance.card.active.set(true);
      await fixture.whenStable();

      expect(classesOf(div)).toEqual(['active', 'px-2', 'px-4']);
      expect(resolver).not.toHaveBeenCalled();
    });
  });

  describeOffSubtree(() => [provideAttributeResolvers({class: cn}, withAutoResolution())]);
});
