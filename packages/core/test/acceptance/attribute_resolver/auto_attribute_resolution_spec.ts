/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AttributeResolver,
  Component,
  createComponent,
  createEnvironmentInjector,
  Directive,
  ElementRef,
  EnvironmentInjector,
  inject,
  joinTokens,
  lastValue,
  provideAttributeResolvers,
  Renderer2,
  signal,
  ViewChild,
  ViewContainerRef,
  withAutoResolution,
  ɵINJECTOR_SCOPE as INJECTOR_SCOPE,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

// The names that automatic resolution covers are process-wide: once a root enrolls the names of its
// map, every template that's created later sets them up. A spec that expects a name to resolve
// enrolls it in its own root providers, and a spec that expects a name not to resolve uses a name
// that no spec in this target enrolls.
describe('automatic resolution of listed attributes', () => {
  @Directive({selector: '[menuItem]', host: {'[attr.role]': 'role()'}})
  class MenuItem {
    readonly role = signal<string | null>('menuitem');
  }

  function recordingResolver(resolver: AttributeResolver = lastValue) {
    return jasmine.createSpy<AttributeResolver>('resolver').and.callFake(resolver);
  }

  it('resolves an attribute that the root map names on an element that a directive matches, without a resolver binding', async () => {
    @Component({
      imports: [MenuItem],
      template: `<li menuItem role="separator"></li>
        <li id="plain" role="separator" [attr.role]="role()"></li>`,
    })
    class App {
      readonly role = signal('menuitem');
      @ViewChild(MenuItem) menuItem!: MenuItem;
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({role: lastValue}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const li: HTMLElement = fixture.nativeElement.querySelector('li');

    expect(li.getAttribute('role')).toBe('separator');
    expect(fixture.nativeElement.querySelector('#plain').getAttribute('role')).toBe('menuitem');

    fixture.componentInstance.menuItem.role.set('tab');
    await fixture.whenStable();

    expect(li.getAttribute('role')).toBe('separator');
  });

  it("passes the root map's resolver one argument per directive and template that sets the attribute", async () => {
    const resolver = recordingResolver((...values) => values.join(' > '));

    @Directive({
      selector: '[described]',
      host: {'[attr.aria-roledescription]': "'directive'"},
    })
    class Described {}

    @Component({
      imports: [Described],
      template: `<li described aria-roledescription="template"></li>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({'aria-roledescription': resolver}, withAutoResolution()),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(resolver.calls.allArgs()).toEqual([['directive', 'template']]);
    expect(fixture.nativeElement.querySelector('li').getAttribute('aria-roledescription')).toBe(
      'directive > template',
    );
  });

  it('joins the tokens of a token list that the root map names', async () => {
    @Directive({selector: '[hint]', host: {'[attr.aria-describedby]': "'hint shared'"}})
    class Hint {}

    @Component({
      imports: [Hint],
      template: `<input hint aria-describedby="shared label" />`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({'aria-describedby': joinTokens}, withAutoResolution()),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-describedby')).toBe(
      'hint shared label',
    );
  });

  it('joins more tokens than a call takes arguments with the built-in rule', async () => {
    @Directive({selector: '[hint]', host: {'[attr.aria-describedby]': 'ids'}})
    class Hint {
      readonly ids = Array.from({length: 200_000}, (_, i) => `t${i}`).join(' ');
    }

    @Component({imports: [Hint], template: `<input hint aria-describedby="t0 label" />`})
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({'aria-describedby': joinTokens}, withAutoResolution()),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const tokens = fixture.nativeElement.querySelector('input').getAttribute('aria-describedby');
    expect(tokens.split(' ').length).toBe(200_001);
  });

  it('removes a token list that the resolver resolves to an empty string', async () => {
    @Directive({selector: '[hint]', host: {'[attr.aria-describedby]': "'hint'"}})
    class Hint {}

    @Component({
      imports: [Hint],
      template: `<input hint aria-describedby="label" />`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({'aria-describedby': () => ''}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-describedby')).toBe(
      false,
    );
  });

  it("resolves styles with the root map's style resolver", async () => {
    const resolver = recordingResolver((...declarations) =>
      declarations.filter((declaration) => !declaration.startsWith('color')).join('; '),
    );

    @Directive({selector: '[padded]', host: {'[style.padding]': "'8px'", 'style': 'color: red'}})
    class Padded {}

    @Component({
      imports: [Padded],
      template: `<div padded style="padding: 4px" [style.margin]="margin()"></div>`,
    })
    class App {
      readonly margin = signal('1px');
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({style: resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');

    expect(resolver.calls.allArgs()).toEqual([['color: red', 'padding: 4px', 'margin: 1px']]);
    expect(div.style.color).toBe('');
    expect(div.style.padding).toBe('4px');
    expect(div.style.margin).toBe('1px');

    fixture.componentInstance.margin.set('2px');
    await fixture.whenStable();

    expect(div.style.padding).toBe('4px');
    expect(div.style.margin).toBe('2px');
  });

  it('leaves an attribute that no root map names unresolved', async () => {
    @Directive({selector: '[unlisted]', host: {'[attr.data-unlisted]': "'directive'"}})
    class Unlisted {}

    @Component({
      imports: [Unlisted],
      template: `<li unlisted data-unlisted="template"></li>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({role: lastValue}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('li').getAttribute('data-unlisted')).toBe(
      'directive',
    );
  });

  it("doesn't resolve the names of a root map without withAutoResolution()", async () => {
    const resolver = recordingResolver();

    @Directive({selector: '[featureless]', host: {'[attr.data-featureless]': "'directive'"}})
    class Featureless {}

    @Component({
      imports: [Featureless],
      template: `<li featureless data-featureless="template"></li>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({'data-featureless': resolver}),
        provideAttributeResolvers({role: lastValue}, withAutoResolution()),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('li').getAttribute('data-featureless')).toBe(
      'directive',
    );
    expect(resolver).not.toHaveBeenCalled();
  });

  describe('with a map below the root', () => {
    @Directive({selector: '[lower]', host: {'[attr.data-lower]': "'directive'"}})
    class Lower {}

    it("takes its resolver for a listed name but doesn't list its own names", async () => {
      const lowerResolver = recordingResolver();

      @Component({
        selector: 'ui-menu',
        imports: [MenuItem, Lower],
        template: `<li menuItem lower role="separator" data-lower="template"></li>`,
        providers: [
          provideAttributeResolvers(
            {role: (...roles) => roles.join('+'), 'data-lower': lowerResolver},
            withAutoResolution(),
          ),
        ],
      })
      class UiMenu {}

      @Component({imports: [UiMenu], template: '<ui-menu />'})
      class App {}

      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({role: lastValue}, withAutoResolution())],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const li: HTMLElement = fixture.nativeElement.querySelector('li');

      expect(li.getAttribute('role')).toBe('menuitem+separator');
      expect(li.getAttribute('data-lower')).toBe('directive');
      expect(lowerResolver).not.toHaveBeenCalled();
    });

    it("doesn't list the names of createComponent()'s environment injector", async () => {
      const lowerResolver = recordingResolver();

      @Component({
        selector: 'app-page',
        imports: [MenuItem, Lower],
        template: `<li menuItem lower role="separator" data-lower="template"></li>`,
      })
      class Page {}

      @Component({template: '<ng-container #slot />'})
      class App {
        @ViewChild('slot', {read: ViewContainerRef, static: true}) slot!: ViewContainerRef;
      }

      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({role: lastValue}, withAutoResolution())],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const environmentInjector = createEnvironmentInjector(
        [provideAttributeResolvers({'data-lower': lowerResolver}, withAutoResolution())],
        TestBed.inject(EnvironmentInjector),
      );

      const page = fixture.componentInstance.slot.createComponent(Page, {environmentInjector});
      await fixture.whenStable();
      const li: HTMLElement = page.location.nativeElement.querySelector('li');

      expect(li.getAttribute('role')).toBe('separator');
      expect(li.getAttribute('data-lower')).toBe('directive');
      expect(lowerResolver).not.toHaveBeenCalled();
    });
  });

  describe('of an attribute whose value is a URL', () => {
    @Directive({selector: '[linkish]', host: {'[attr.href]': 'href'}})
    class Linkish {
      readonly href = '/directive';
    }

    it('skips it on an element where it is a URL, and resolves it elsewhere', async () => {
      const resolver = recordingResolver();

      @Component({
        imports: [Linkish],
        template: `<a id="html" linkish href="/template"></a>
          <svg><a id="svg" linkish href="/template"></a></svg>
          <div id="div" linkish href="/template"></div>`,
      })
      class App {}

      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({href: resolver}, withAutoResolution())],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const href = (id: string) =>
        fixture.nativeElement.querySelector(`#${id}`).getAttribute('href');

      expect(href('html')).toBe('/directive');
      expect(href('svg')).toBe('/directive');
      expect(href('div')).toBe('/template');
      expect(resolver.calls.allArgs()).toEqual([['/directive', '/template']]);
    });
  });

  describe('in production mode', () => {
    const _global = globalThis as unknown as {ngDevMode: unknown};
    let savedNgDevMode: unknown;
    beforeEach(() => (savedNgDevMode = _global.ngDevMode));
    afterEach(() => (_global.ngDevMode = savedNgDevMode));

    it('skips an event handler attribute', async () => {
      _global.ngDevMode = false;
      const resolver = jasmine
        .createSpy<AttributeResolver>('resolver')
        .and.returnValue('resolved()');

      @Directive({selector: '[hovered]', host: {'onmouseenter': 'directive()'}})
      class Hovered {}

      @Component({
        imports: [Hovered],
        template: `<div hovered onmouseenter="template()"></div>`,
      })
      class App {}

      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({onmouseenter: resolver}, withAutoResolution())],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('div').getAttribute('onmouseenter')).toBe(
        'template()',
      );
      expect(resolver).not.toHaveBeenCalled();
    });
  });

  describe('of a name that another root lists later', () => {
    /**
     * Creates a component in another root that lists `name`, while the app runs, and returns a
     * function that destroys them.
     */
    function listInAnotherRoot(name: string) {
      @Component({template: ''})
      class Other {}

      const root = createEnvironmentInjector(
        [
          {provide: INJECTOR_SCOPE, useValue: 'root'},
          provideAttributeResolvers({[name]: lastValue}, withAutoResolution()),
        ],
        TestBed.inject(EnvironmentInjector),
      );
      const other = createComponent(Other, {environmentInjector: root});
      return () => {
        other.destroy();
        root.destroy();
      };
    }

    @Directive({selector: '[later]', host: {'[attr.data-later]': "'directive'"}})
    class Later {}

    it("resolves it in a template first created after it's listed, with the resolver of the view that declares the template", async () => {
      @Component({
        imports: [Later],
        template: `@if (shown()) {
          <div later data-later="template"></div>
        }`,
      })
      class App {
        readonly shown = signal(false);
      }

      TestBed.configureTestingModule({
        providers: [
          provideAttributeResolvers({'data-later': () => 'from-app'}),
          provideAttributeResolvers({}, withAutoResolution()),
        ],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const destroyOtherRoot = listInAnotherRoot('data-later');

      fixture.componentInstance.shown.set(true);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('div').getAttribute('data-later')).toBe(
        'from-app',
      );
      destroyOtherRoot();
    });

    it("doesn't resolve it in a template first created before it's listed", async () => {
      @Directive({selector: '[earlier]', host: {'[attr.data-earlier]': "'directive'"}})
      class Earlier {}

      @Component({
        selector: 'listed-item',
        imports: [Earlier],
        template: `<div earlier data-earlier="template"></div>`,
      })
      class ListedItem {}

      @Component({
        imports: [ListedItem],
        template: `@for (item of items(); track item) {
          <listed-item />
        }`,
      })
      class App {
        readonly items = signal([0]);
      }

      TestBed.configureTestingModule({
        providers: [
          provideAttributeResolvers({'data-earlier': () => 'from-app'}),
          provideAttributeResolvers({}, withAutoResolution()),
        ],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const destroyOtherRoot = listInAnotherRoot('data-earlier');

      fixture.componentInstance.items.set([0, 1]);
      await fixture.whenStable();

      const values = Array.from(
        fixture.nativeElement.querySelectorAll('div') as NodeListOf<HTMLElement>,
        (div) => div.getAttribute('data-earlier'),
      );
      expect(values).toEqual(['directive', 'directive']);
      destroyOtherRoot();
    });
  });

  describe('of a template that instances share', () => {
    function createUiItem() {
      @Component({
        selector: 'ui-item',
        imports: [MenuItem],
        template: `<li menuItem role="separator"></li>`,
      })
      class UiItem {
        @ViewChild(MenuItem, {static: true}) menuItem!: MenuItem;
      }
      return UiItem;
    }

    async function expectPerInstance(template: string) {
      const UiItem = createUiItem();

      @Component({
        selector: 'off-item',
        imports: [UiItem],
        template: '<ui-item />',
        providers: [provideAttributeResolvers({}, withAutoResolution(false))],
      })
      class OffItem {}

      @Component({imports: [UiItem, OffItem], template})
      class App {}

      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({role: lastValue}, withAutoResolution())],
      });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const on: HTMLElement = fixture.nativeElement.querySelector('#on li');
      const off: HTMLElement = fixture.nativeElement.querySelector('off-item li');

      expect(on.getAttribute('role')).toBe('separator');
      expect(off.getAttribute('role')).toBe('menuitem');

      for (const item of fixture.debugElement.queryAll(
        (debugElement) => debugElement.componentInstance instanceof UiItem,
      )) {
        (item.componentInstance as InstanceType<typeof UiItem>).menuItem.role.set('tab');
      }
      await fixture.whenStable();

      expect(on.getAttribute('role')).toBe('separator');
      expect(off.getAttribute('role')).toBe('tab');
    }

    it('resolves it per instance when the first instance is created where it is on', async () => {
      await expectPerInstance('<ui-item id="on" /><off-item />');
    });

    it('resolves it per instance when the first instance is created where it is off', async () => {
      await expectPerInstance('<off-item /><ui-item id="on" />');
    });
  });

  it('calls the resolver again only when the values of a source change', async () => {
    const resolver = recordingResolver();

    @Directive({selector: '[stated]', host: {'[attr.aria-current]': 'current()'}})
    class Stated {
      readonly current = signal('page');
    }

    @Component({
      imports: [Stated],
      template: `<li stated aria-current="step"></li>
        {{ count() }}`,
    })
    class App {
      readonly count = signal(0);
      @ViewChild(Stated) stated!: Stated;
    }

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({'aria-current': resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(resolver.calls.allArgs()).toEqual([['page', 'step']]);

    fixture.componentInstance.count.set(1);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('1');
    expect(resolver.calls.allArgs()).toEqual([['page', 'step']]);

    fixture.componentInstance.stated.current.set('location');
    await fixture.whenStable();

    expect(resolver.calls.allArgs()).toEqual([
      ['page', 'step'],
      ['location', 'step'],
    ]);
  });

  it('resolves an attribute with a resolver binding only through that binding', async () => {
    const resolver = recordingResolver();

    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Component({
      imports: [MenuItem, Tone],
      template: `<li
        menuItem
        tone
        class="px-4"
        role="separator"
        (attr.aria-sort)="$event.resolve('explicit')"
        aria-sort="template"
      ></li>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers(
          {class: (...classes) => classes.slice(-1).join(' '), 'aria-sort': resolver},
          withAutoResolution(),
        ),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const li: HTMLElement = fixture.nativeElement.querySelector('li');

    expect(li.getAttribute('aria-sort')).toBe('explicit');
    expect(resolver).not.toHaveBeenCalled();
    expect(li.className).toBe('px-4');
  });

  it("doesn't touch an attribute that no source of the element sets", async () => {
    const resolver = recordingResolver(() => null);

    @Directive({selector: '[labelled]'})
    class Labelled {
      constructor() {
        inject(Renderer2).setAttribute(inject(ElementRef).nativeElement, 'aria-keyshortcuts', 'K');
      }
    }

    @Component({imports: [Labelled], template: `<button labelled></button>`})
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({'aria-keyshortcuts': resolver}, withAutoResolution())],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-keyshortcuts')).toBe(
      'K',
    );
    expect(resolver).not.toHaveBeenCalled();
  });
});
