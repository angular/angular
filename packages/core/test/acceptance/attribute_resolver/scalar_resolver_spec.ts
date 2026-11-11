/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '@angular/localize/init';

import {
  AttributeResolver,
  BoundClassResolver,
  ClassResolveEvent,
  Component,
  Directive,
  inject,
  joinTokens,
  joinValues,
  lastValue,
  provideAttributeResolvers,
  Renderer2,
  ResolvedAttribute,
  signal,
  Type,
  ViewChild,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {clearTranslations, loadTranslations} from '@angular/localize';
import {DomSanitizer} from '@angular/platform-browser';

interface ScalarResolveEvent {
  readonly sources: readonly [
    component: readonly string[],
    directives: readonly string[],
    template: readonly string[],
  ];
  resolver(...extras: Array<string | readonly string[]>): ResolvedAttribute;
  resolve(value: string | readonly string[] | ResolvedAttribute | null): void;
}

function spyOnAttributeWrites(renderer: Renderer2, element: Element): () => string[] {
  const writes: string[] = [];
  spyOn(renderer, 'setProperty').and.callFake(function (this: Renderer2, el, name, value) {
    if (el === element) {
      writes.push(`.${name}=${value}`);
    }
    Object.getPrototypeOf(renderer).setProperty.call(this, el, name, value);
  });
  spyOn(renderer, 'setAttribute').and.callFake(function (this: Renderer2, el, name, value) {
    if (el === element) {
      writes.push(`${name}=${value}`);
    }
    Object.getPrototypeOf(renderer).setAttribute.call(this, el, name, value);
  });
  spyOn(renderer, 'removeAttribute').and.callFake(function (this: Renderer2, el, name) {
    if (el === element) {
      writes.push(`-${name}`);
    }
    Object.getPrototypeOf(renderer).removeAttribute.call(this, el, name);
  });
  return () => writes.splice(0);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function render<T>(component: Type<T>) {
  const fixture = TestBed.createComponent(component);
  await fixture.whenStable();
  return fixture;
}

/** Wraps `target` in a proxy that calls `reenter` the first time its prototype is read. */
function reenteringProxy<T extends object>(target: T, reenter: () => void): T {
  let entered = false;
  return new Proxy(target, {
    getPrototypeOf(proxied) {
      if (!entered) {
        entered = true;
        reenter();
      }
      return Reflect.getPrototypeOf(proxied);
    },
  });
}

@Directive({selector: '[menuItem]', host: {'[attr.role]': 'role()'}})
class MenuItem {
  readonly role = signal<string | null>('menuitem');
}

describe('(attr.x) binding of an attribute that holds one value', () => {
  it("resolves the template's static value over a directive's binding", async () => {
    @Component({
      imports: [MenuItem],
      template: `<li
        menuItem
        role="separator"
        (attr.role)="$event.resolve($event.resolver())"
      ></li>`,
    })
    class App {}

    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('li').getAttribute('role')).toBe('separator');
  });

  it("keeps the template's value when a component's binding goes null", async () => {
    @Component({selector: 'ui-item', template: '', host: {'[attr.id]': 'id()'}})
    class UiItem {
      readonly id = signal<string | null>('cmp');
    }

    @Component({
      imports: [UiItem],
      template: `<ui-item id="tpl" (attr.id)="record($event)" />`,
    })
    class App {
      @ViewChild(UiItem) item!: UiItem;
      sources: ScalarResolveEvent['sources'] | null = null;

      protected record(event: ScalarResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);
    const host = fixture.nativeElement.querySelector('ui-item');
    expect(fixture.componentInstance.sources).toEqual([['cmp'], [], ['tpl']]);
    expect(host.getAttribute('id')).toBe('tpl');

    fixture.componentInstance.item.id.set(null);
    await fixture.whenStable();

    expect(fixture.componentInstance.sources).toEqual([[], [], ['tpl']]);
    expect(host.getAttribute('id')).toBe('tpl');
  });

  describe('with a translated static value', () => {
    afterEach(() => {
      clearTranslations();
    });

    it("resolves it as the template's value", async () => {
      @Directive({selector: '[hint]', host: {'[attr.title]': 'hint()'}})
      class Hint {
        readonly hint = signal('bound');
      }

      @Component({
        imports: [Hint],
        template: `<button
          hint
          i18n-title="@@saveTitle"
          title="Save"
          (attr.title)="$event.resolve($event.resolver())"
        ></button>`,
      })
      class App {}

      loadTranslations({saveTitle: 'Enregistrer'});
      const fixture = await render(App);

      expect(fixture.nativeElement.querySelector('button').getAttribute('title')).toBe(
        'Enregistrer',
      );
    });

    it("resolves a translated interpolation as the template's value", async () => {
      @Component({
        template: `<button
          attr.title="Hi {{ name() }}"
          i18n-attr.title="@@greeting"
          (attr.title)="record($event)"
        ></button>`,
      })
      class App {
        readonly name = signal('Ann');
        sources: ScalarResolveEvent['sources'] | null = null;

        protected record(event: ScalarResolveEvent) {
          this.sources = event.sources;
          event.resolve(event.resolver());
        }
      }

      loadTranslations({greeting: 'Bonjour {$INTERPOLATION}'});
      const fixture = await render(App);
      const button = fixture.nativeElement.querySelector('button');
      expect(fixture.componentInstance.sources).toEqual([[], [], ['Bonjour Ann']]);
      expect(button.getAttribute('title')).toBe('Bonjour Ann');

      fixture.componentInstance.name.set('Bob');
      await fixture.whenStable();

      expect(fixture.componentInstance.sources).toEqual([[], [], ['Bonjour Bob']]);
      expect(button.getAttribute('title')).toBe('Bonjour Bob');
    });

    it("passes a translated interpolation to a directive's resolver as the template's value", async () => {
      @Directive({
        selector: '[titled]',
        host: {'(attr.title)': 'record($event)'},
      })
      class Titled {
        sources: ScalarResolveEvent['sources'] | null = null;

        record(event: ScalarResolveEvent) {
          this.sources = event.sources;
          event.resolve(event.resolver());
        }
      }

      @Component({
        imports: [Titled],
        template: `<button
          titled
          attr.title="Hi {{ name() }}"
          i18n-attr.title="@@greeting"
        ></button>`,
      })
      class App {
        readonly name = signal('Ann');
        @ViewChild(Titled) titled!: Titled;
      }

      loadTranslations({greeting: 'Bonjour {$INTERPOLATION}'});
      const fixture = await render(App);
      const button = fixture.nativeElement.querySelector('button');
      expect(fixture.componentInstance.titled.sources).toEqual([[], [], ['Bonjour Ann']]);
      expect(button.getAttribute('title')).toBe('Bonjour Ann');

      fixture.componentInstance.name.set('Bob');
      await fixture.whenStable();

      expect(fixture.componentInstance.titled.sources).toEqual([[], [], ['Bonjour Bob']]);
      expect(button.getAttribute('title')).toBe('Bonjour Bob');
    });

    it('applies a translated interpolation without a resolver binding', async () => {
      @Component({
        template: `<button attr.title="Hi {{ name() }}" i18n-attr.title="@@greeting"></button>`,
      })
      class App {
        readonly name = signal('Ann');
      }

      loadTranslations({greeting: 'Bonjour {$INTERPOLATION}'});
      const fixture = await render(App);
      const button = fixture.nativeElement.querySelector('button');
      expect(button.title).toBe('Bonjour Ann');

      fixture.componentInstance.name.set('Bob');
      await fixture.whenStable();

      expect(button.title).toBe('Bonjour Bob');
    });

    it("doesn't write a resolved translated interpolation directly", async () => {
      @Component({
        template: `<button
          attr.title="Hi {{ name() }}"
          i18n-attr.title="@@greeting"
          (attr.title)="$event.resolve('Fixed')"
        ></button>`,
      })
      class App {
        readonly renderer = inject(Renderer2);
        readonly name = signal('Ann');
      }

      loadTranslations({greeting: 'Bonjour {$INTERPOLATION}'});
      const fixture = TestBed.createComponent(App);
      const button: HTMLElement = fixture.nativeElement.querySelector('button');
      const writes = spyOnAttributeWrites(fixture.componentInstance.renderer, button);
      await fixture.whenStable();
      expect(writes()).toEqual(['title=Fixed']);

      fixture.componentInstance.name.set('Bob');
      await fixture.whenStable();

      expect(writes()).toEqual([]);
      expect(button.getAttribute('title')).toBe('Fixed');
    });

    for (const [description, translation] of [
      ['without placeholders', 'Bonjour'],
      ['that is empty', ''],
    ]) {
      it(`resolves a translation ${description} as the template's value`, async () => {
        @Component({
          template: `<button
            attr.title="Hi {{ name() }}"
            i18n-attr.title="@@greeting"
            (attr.title)="record($event)"
          ></button>`,
        })
        class App {
          readonly name = signal('Ann');
          sources: ScalarResolveEvent['sources'] | null = null;

          protected record(event: ScalarResolveEvent) {
            this.sources = event.sources;
            event.resolve(event.resolver());
          }
        }

        loadTranslations({greeting: translation});
        const fixture = await render(App);
        const button = fixture.nativeElement.querySelector('button');
        expect(fixture.componentInstance.sources).toEqual([[], [], [translation]]);
        expect(button.getAttribute('title')).toBe(translation);

        fixture.componentInstance.name.set('Bob');
        await fixture.whenStable();

        expect(fixture.componentInstance.sources).toEqual([[], [], [translation]]);
        expect(button.getAttribute('title')).toBe(translation);
      });
    }

    it('applies the attribute binding over a property binding of the same name', async () => {
      @Component({
        template: `<button
          title="Property {{ a() }}"
          i18n-title
          attr.title="Attribute {{ b() }}"
          i18n-attr.title
        ></button>`,
      })
      class App {
        readonly a = signal('a');
        readonly b = signal('b');
      }

      const fixture = await render(App);

      expect(fixture.nativeElement.querySelector('button').title).toBe('Attribute b');
    });

    it("doesn't take a namespaced translated interpolation as a source", async () => {
      @Component({
        template: `<svg>
          <g
            attr.xlink:attr.title="Hi {{ name() }}"
            i18n-attr.xlink:attr.title
            (attr.title)="record($event)"
          ></g>
        </svg>`,
      })
      class App {
        readonly name = signal('Ann');
        sources: ScalarResolveEvent['sources'] | null = null;

        protected record(event: ScalarResolveEvent) {
          this.sources = event.sources;
          event.resolve(event.resolver());
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.sources).toEqual([[], [], []]);
      expect(fixture.nativeElement.querySelector('g').hasAttribute('title')).toBeFalse();
    });
  });

  it("resolves classes and another attribute on one element without writing each other's", async () => {
    @Component({
      imports: [MenuItem],
      template: `<li
        menuItem
        class="item"
        [class.active]="active()"
        role="separator"
        (class)="(resolveClasses)"
        (attr.role)="$event.resolve(role())"
      ></li>`,
    })
    class App {
      readonly renderer = inject(Renderer2);
      readonly active = signal(false);
      readonly role = signal('menuitemradio');
      protected readonly resolveClasses = (cn: BoundClassResolver) => cn('extra');
    }

    const fixture = await render(App);
    const li: HTMLElement = fixture.nativeElement.querySelector('li');
    expect(li.className).toBe('item extra');
    expect(li.getAttribute('role')).toBe('menuitemradio');

    const writes = spyOnAttributeWrites(fixture.componentInstance.renderer, li);

    fixture.componentInstance.active.set(true);
    await fixture.whenStable();
    // Classes are written through `addClass`.
    expect(writes()).toEqual([]);
    expect(li.className).toBe('item extra active');

    fixture.componentInstance.role.set('menuitemcheckbox');
    await fixture.whenStable();
    expect(writes()).toEqual(['role=menuitemcheckbox']);
    expect(li.className).toBe('item extra active');
    expect(li.getAttribute('role')).toBe('menuitemcheckbox');
  });

  it('writes the attribute only when the resolved value changes', async () => {
    @Component({
      imports: [MenuItem],
      template: `<li
        menuItem
        role="separator"
        (attr.role)="$event.resolve($event.resolver())"
      ></li>`,
    })
    class App {
      readonly renderer = inject(Renderer2);
      @ViewChild(MenuItem) menuItem!: MenuItem;
    }

    // Creating the element writes its static attributes.
    const fixture = TestBed.createComponent(App);
    const li: HTMLElement = fixture.nativeElement.querySelector('li');
    const writes = spyOnAttributeWrites(fixture.componentInstance.renderer, li);

    await fixture.whenStable();
    fixture.componentInstance.menuItem.role.set('tab');
    await fixture.whenStable();

    expect(writes()).toEqual([]);
    expect(li.getAttribute('role')).toBe('separator');
  });

  it('removes the attribute when the value resolves to null', async () => {
    @Component({template: `<li role="separator" (attr.role)="$event.resolve(null)"></li>`})
    class App {}

    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('li').hasAttribute('role')).toBeFalse();
  });

  it('joins an array with a space', async () => {
    @Component({
      template: `<li (attr.aria-label)="$event.resolve(['Save', 'draft'])"></li>`,
    })
    class App {}

    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('li').getAttribute('aria-label')).toBe('Save draft');
  });

  describe('with the app resolver of the attribute', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({role: (...values) => values.join('+')})],
      });
    });

    it("calls it with one argument per value, the extras at the end of the caller's source", async () => {
      @Component({
        imports: [MenuItem],
        template: `<li
          menuItem
          role="separator"
          (attr.role)="$event.resolve($event.resolver('a', ['b', 'c']))"
        ></li>`,
      })
      class App {}

      const fixture = await render(App);

      expect(fixture.nativeElement.querySelector('li').getAttribute('role')).toBe(
        'menuitem+separator+a+b c',
      );
    });

    it("keeps the last value, without the app's resolver, when the handler doesn't call resolve()", async () => {
      @Component({
        imports: [MenuItem],
        template: `<li menuItem role="separator" (attr.role)="record($event)"></li>`,
      })
      class App {
        sources: ScalarResolveEvent['sources'] | null = null;

        protected record(event: ScalarResolveEvent) {
          this.sources = event.sources;
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.sources).toEqual([[], ['menuitem'], ['separator']]);
      expect(fixture.nativeElement.querySelector('li').getAttribute('role')).toBe('separator');
    });
  });

  it("matches an attribute's name in the map as written", async () => {
    @Component({
      template: `<svg
          id="camel"
          viewBox="0 0 10 10"
          (attr.viewBox)="$event.resolve($event.resolver('0 0 20 20'))"
        ></svg>
        <svg
          id="lower"
          viewbox="0 0 30 30"
          (attr.viewbox)="$event.resolve($event.resolver('0 0 40 40'))"
        ></svg>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({viewBox: joinValues(', ')}),
        provideAttributeResolvers({viewbox: joinValues(' | ')}),
      ],
    });
    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('#camel').getAttribute('viewBox')).toBe(
      '0 0 10 10, 0 0 20 20',
    );
    expect(fixture.nativeElement.querySelector('#lower').getAttribute('viewbox')).toBe(
      '0 0 30 30 | 0 0 40 40',
    );
  });

  describe('folds the value that a lower-priority binding resolves', () => {
    function appWith(tab: Type<unknown>) {
      @Component({
        imports: [tab],
        template: `<li tab role="separator" (attr.role)="record($event)"></li>`,
      })
      class App {
        sources: ScalarResolveEvent['sources'] | null = null;

        protected record(event: ScalarResolveEvent) {
          this.sources = event.sources;
          event.resolve(event.resolver());
        }
      }
      return App;
    }

    it('into the source that set it', async () => {
      @Directive({
        selector: '[tab]',
        host: {'role': 'tab', '(attr.role)': '$event.resolve($event.resolver())'},
      })
      class Tab {}

      const fixture = await render(appWith(Tab));

      expect(fixture.componentInstance.sources).toEqual([[], [], ['separator']]);
    });

    it('into no source when it is null', async () => {
      @Directive({selector: '[tab]', host: {'role': 'tab', '(attr.role)': '$event.resolve(null)'}})
      class Tab {}

      const fixture = await render(appWith(Tab));

      expect(fixture.componentInstance.sources).toEqual([[], [], []]);
      expect(fixture.nativeElement.querySelector('li').hasAttribute('role')).toBeFalse();
    });

    it('into the highest-priority source that gave it', async () => {
      @Component({selector: 'ui-item', template: '', host: {'role': 'separator'}})
      class UiItem {}

      @Directive({selector: '[tab]', host: {'(attr.role)': `$event.resolve('separator')`}})
      class Tab {}

      @Component({
        imports: [UiItem, Tab],
        template: `<ui-item tab role="separator" (attr.role)="record($event)" />`,
      })
      class App {
        sources: ScalarResolveEvent['sources'] | null = null;

        protected record(event: ScalarResolveEvent) {
          this.sources = event.sources;
          event.resolve(event.resolver());
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.sources).toEqual([[], [], ['separator']]);
    });

    it("into the source of the binding's owner when no source set it", async () => {
      @Directive({selector: '[tab]', host: {'(attr.role)': `$event.resolve('tab')`}})
      class Tab {}

      const fixture = await render(appWith(Tab));

      expect(fixture.componentInstance.sources).toEqual([[], ['tab'], []]);
      expect(fixture.nativeElement.querySelector('li').getAttribute('role')).toBe('tab');
    });
  });

  it("falls back to a contributor's static value while its binding has none", async () => {
    @Directive({selector: '[tab]', host: {'role': 'tab', '[attr.role]': 'role()'}})
    class Tab {
      readonly role = signal<string | null | undefined>('a');
    }

    @Component({
      imports: [Tab],
      template: `<li tab (attr.role)="record($event)"></li>`,
    })
    class App {
      readonly renderer = inject(Renderer2);
      @ViewChild(Tab) tab!: Tab;
      sources: ScalarResolveEvent['sources'] | null = null;

      protected record(event: ScalarResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = TestBed.createComponent(App);
    const li: HTMLElement = fixture.nativeElement.querySelector('li');
    const writes = spyOnAttributeWrites(fixture.componentInstance.renderer, li);
    const steps: Array<[string | null | undefined, unknown, string | null, string[]]> = [];
    for (const value of ['a', 'b', null, undefined, 'c']) {
      if (value !== 'a') {
        fixture.componentInstance.tab.role.set(value);
      }
      await fixture.whenStable();
      steps.push([value, fixture.componentInstance.sources, li.getAttribute('role'), writes()]);
    }

    expect(steps).toEqual([
      ['a', [[], ['a'], []], 'a', ['role=a']],
      ['b', [[], ['b'], []], 'b', ['role=b']],
      [null, [[], ['tab'], []], 'tab', ['role=tab']],
      [undefined, [[], ['tab'], []], 'tab', []],
      ['c', [[], ['c'], []], 'c', ['role=c']],
    ]);
  });

  it('removes the attribute and adds it back', async () => {
    @Component({
      template: `<li role="tab" (attr.role)="$event.resolve(role())"></li>
        {{ refreshes() }}`,
    })
    class App {
      readonly renderer = inject(Renderer2);
      readonly role = signal<string | null>('tab');
      readonly refreshes = signal(0);
    }

    const fixture = TestBed.createComponent(App);
    const li: HTMLElement = fixture.nativeElement.querySelector('li');
    const writes = spyOnAttributeWrites(fixture.componentInstance.renderer, li);
    await fixture.whenStable();
    expect(writes()).toEqual([]);

    fixture.componentInstance.role.set(null);
    await fixture.whenStable();
    expect(writes()).toEqual(['-role']);
    expect(li.hasAttribute('role')).toBeFalse();

    // Refresh the view without changing the resolved value.
    fixture.componentInstance.refreshes.set(1);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.trim()).toBe('1');
    expect(writes()).toEqual([]);

    fixture.componentInstance.role.set('tab');
    await fixture.whenStable();
    expect(writes()).toEqual(['role=tab']);
    expect(li.getAttribute('role')).toBe('tab');
  });

  it('resolves two attributes on one element independently', async () => {
    @Component({
      template: `<li
        (attr.role)="$event.resolve(role())"
        (attr.aria-label)="$event.resolve(label())"
      ></li>`,
    })
    class App {
      readonly renderer = inject(Renderer2);
      readonly role = signal('tab');
      readonly label = signal('Home');
    }

    const fixture = TestBed.createComponent(App);
    const li: HTMLElement = fixture.nativeElement.querySelector('li');
    const writes = spyOnAttributeWrites(fixture.componentInstance.renderer, li);
    await fixture.whenStable();
    expect(writes()).toEqual(['role=tab', 'aria-label=Home']);

    fixture.componentInstance.role.set('menuitem');
    await fixture.whenStable();
    expect(writes()).toEqual(['role=menuitem']);

    fixture.componentInstance.label.set('Settings');
    await fixture.whenStable();
    expect(writes()).toEqual(['aria-label=Settings']);
    expect(li.getAttribute('role')).toBe('menuitem');
  });

  it('reads a trusted image URL from its source', async () => {
    @Component({template: `<img [attr.src]="src" (attr.src)="record($event)" />`})
    class App {
      readonly src = inject(DomSanitizer).bypassSecurityTrustUrl('/assets/logo.png');
      sources: ScalarResolveEvent['sources'] | null = null;

      protected record(event: ScalarResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([[], [], ['/assets/logo.png']]);
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/assets/logo.png');
  });

  it('reports a binding on <ng-container> with the attribute in dev mode', async () => {
    const error = spyOn(console, 'error');

    @Component({
      template: `<ng-container (attr.role)="received.push($event)" />`,
    })
    class App {
      readonly received: unknown[] = [];
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.received).toEqual([]);
    expect(error.calls.allArgs()).toEqual([
      [
        jasmine.stringMatching(
          /^NG0321: The `\(attr\.role\)` binding can't resolve the `role` attribute on /,
        ),
      ],
    ]);
  });

  it("joins the values with joinValues(', '), keeping repeated ones", async () => {
    @Directive({selector: '[labeled]', host: {'data-labels': 'a'}})
    class Labeled {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({'data-labels': joinValues(', ')})],
    });

    @Component({
      imports: [Labeled],
      template: `<li
        labeled
        data-labels="b"
        (attr.data-labels)="$event.resolve($event.resolver('c', 'a'))"
      ></li>`,
    })
    class App {}

    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('li').getAttribute('data-labels')).toBe(
      'a, b, c, a',
    );
  });

  describe('when two directives set different values', () => {
    @Directive({selector: '[testId]', host: {'data-testid': 'static-id'}})
    class TestId {}

    @Directive({selector: '[boundTestId]', host: {'[attr.data-testid]': 'id()'}})
    class BoundTestId {
      readonly id = signal<string | null>('bound-id');
    }

    const warning =
      'NG0324: Directives `TestId` and `BoundTestId` set different values for the ' +
      '`data-testid` attribute of an element: `static-id` and `bound-id`. Reconcile the values ' +
      'that the directives contribute, for example by setting the attribute in only one of them.';

    it('warns once per element in dev mode', async () => {
      const warn = spyOn(console, 'warn');

      @Component({
        imports: [TestId, BoundTestId],
        template: `
          <li testId boundTestId (attr.data-testid)="$event.resolve($event.resolver())"></li>
          <li testId boundTestId (attr.data-testid)="$event.resolve($event.resolver())"></li>
        `,
      })
      class App {}

      const fixture = await render(App);
      const boundTestIds = fixture.debugElement.children.map((child) =>
        child.injector.get(BoundTestId),
      );

      expect(warn.calls.allArgs()).toEqual([
        [jasmine.stringMatching(new RegExp('^' + escapeRegExp(warning)))],
        [jasmine.stringMatching(new RegExp('^' + escapeRegExp(warning)))],
      ]);
      expect(fixture.nativeElement.querySelector('li').getAttribute('data-testid')).toBe(
        'bound-id',
      );

      warn.calls.reset();
      boundTestIds[0].id.set('other-id');
      await fixture.whenStable();

      expect(warn).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('li').getAttribute('data-testid')).toBe(
        'other-id',
      );
    });

    it("warns with a resolver that combines the values and a template's value", async () => {
      const warn = spyOn(console, 'warn');
      TestBed.configureTestingModule({
        providers: [provideAttributeResolvers({'data-testid': joinValues(', ')})],
      });

      @Component({
        imports: [TestId, BoundTestId],
        template: `<li
          testId
          boundTestId
          data-testid="tpl-id"
          (attr.data-testid)="$event.resolve($event.resolver())"
        ></li>`,
      })
      class App {}

      const fixture = await render(App);

      expect(warn.calls.allArgs()).toEqual([
        [jasmine.stringMatching(new RegExp('^' + escapeRegExp(warning)))],
      ]);
      expect(fixture.nativeElement.querySelector('li').getAttribute('data-testid')).toBe(
        'static-id, bound-id, tpl-id',
      );
    });

    it("doesn't warn when they set the same value, or about the template's value", async () => {
      const warn = spyOn(console, 'warn');

      @Directive({selector: '[sameTestId]', host: {'[attr.data-testid]': "'static-id'"}})
      class SameTestId {}

      @Component({
        imports: [TestId, SameTestId],
        template: `<li
          testId
          sameTestId
          data-testid="tpl-id"
          (attr.data-testid)="$event.resolve($event.resolver())"
        ></li>`,
      })
      class App {}

      const fixture = await render(App);

      expect(warn).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('li').getAttribute('data-testid')).toBe('tpl-id');
    });
  });

  it('reports a second call to resolve() with the binding in dev mode', async () => {
    @Component({
      template: `<li (attr.role)="$event.resolve('a'); $event.resolve('b')"></li>`,
    })
    class App {}

    await expectAsync(render(App)).toBeRejectedWithError(
      /NG0320: The `\(attr\.role\)` handler called `resolve\(\)` more than once/,
    );
  });

  @Component({template: `<li (attr.role)="$event.resolve([reentrant($event)])"></li>`})
  class ReentrantApp {
    protected reentrant(event: ScalarResolveEvent) {
      return {
        toString() {
          event.resolve('inner');
          return 'outer';
        },
      } as unknown as string;
    }
  }

  it('reports a call to resolve() from an entry that resolve() reads in dev mode', async () => {
    await expectAsync(render(ReentrantApp)).toBeRejectedWithError(/NG0320/);
  });

  @Component({template: `<li (attr.role)="$event.resolve(reentrant($event))"></li>`})
  class ProxyReentrantApp {
    protected reentrant(event: ScalarResolveEvent) {
      return reenteringProxy(['outer'], () => event.resolve('inner'));
    }
  }

  it('reports a call to resolve() from a check of the value that resolve() makes in dev mode', async () => {
    await expectAsync(render(ProxyReentrantApp)).toBeRejectedWithError(
      /NG0320: The `\(attr\.role\)` handler called `resolve\(\)` more than once/,
    );
  });

  describe('with a result of another resolve event', () => {
    @Component({
      template: `<li
        class="token"
        role="menu"
        (attr.class)="keep($event)"
        (attr.role)="$event.resolve(kept)"
      ></li>`,
    })
    class ClassResultApp {
      kept: ResolvedAttribute | null = null;

      protected keep(event: ClassResolveEvent) {
        this.kept = event.resolver();
        event.resolve(this.kept);
      }
    }

    @Component({
      template: `<li
        aria-label="Save"
        role="menu"
        (attr.aria-label)="keep($event)"
        (attr.role)="$event.resolve(kept)"
      ></li>`,
    })
    class LabelResultApp {
      kept: ResolvedAttribute | null = null;

      protected keep(event: ScalarResolveEvent) {
        this.kept = event.resolver();
        event.resolve(this.kept);
      }
    }

    @Component({
      template: `<li
        aria-describedby="hint"
        role="menu"
        (attr.aria-describedby)="keep($event)"
        (attr.role)="resolveWith($event)"
      ></li>`,
    })
    class TokenResultApp {
      kept: ResolvedAttribute | null = null;
      readKept: ResolvedAttribute | null = null;

      protected keep(event: ScalarResolveEvent) {
        this.kept = event.resolver('error');
        event.resolve(this.kept);
      }

      protected resolveWith(event: ScalarResolveEvent) {
        this.readKept = this.kept;
        event.resolve(this.kept);
      }
    }

    it("reports the classes of the element's class event in dev mode", async () => {
      await expectAsync(render(ClassResultApp)).toBeRejectedWithError(
        /NG0320: The `\(attr\.role\)` handler .*belongs to another resolve event/,
      );
    });

    it("reports the value of another attribute's event in dev mode", async () => {
      await expectAsync(render(LabelResultApp)).toBeRejectedWithError(
        /NG0320: The `\(attr\.role\)` handler .*belongs to another resolve event/,
      );
    });

    it('reports a result passed to the resolver in dev mode', async () => {
      @Component({
        template: `<li (attr.role)="$event.resolve($event.resolver($event.resolver('a')))"></li>`,
      })
      class App {}

      await expectAsync(render(App)).toBeRejectedWithError(
        /NG0320: The `\(attr\.role\)` handler passed a result to `resolver\(\)`/,
      );
    });

    describe('in production mode', () => {
      const _global: {ngDevMode: unknown} = globalThis as any;
      let savedNgDevMode: unknown;
      beforeEach(() => {
        savedNgDevMode = _global.ngDevMode;
        _global.ngDevMode = false;
      });
      afterEach(() => (_global.ngDevMode = savedNgDevMode));

      it('reads the classes of a class event as no value', async () => {
        const fixture = await render(ClassResultApp);

        expect(fixture.nativeElement.querySelector('li').hasAttribute('role')).toBeFalse();
      });

      it("reads the value of another attribute's event as its value", async () => {
        const fixture = await render(LabelResultApp);

        expect(fixture.nativeElement.querySelector('li').getAttribute('role')).toBe('Save');
      });

      it('reads the tokens of a token list event as no value', async () => {
        const fixture = await render(TokenResultApp);
        const li = fixture.nativeElement.querySelector('li');

        expect(fixture.componentInstance.readKept).not.toBeNull();
        expect(li.getAttribute('aria-describedby')).toBe('hint error');
        expect(li.hasAttribute('role')).toBeFalse();
      });
    });
  });

  for (const template of [
    `<li (attr.role)="$event.resolve(fn)"></li>`,
    `<li (attr.role)="$event.resolve($event.resolver(fn))"></li>`,
  ]) {
    it(`reports a function in ${template} in dev mode`, async () => {
      @Component({template})
      class App {
        readonly fn = () => 'menu';
      }

      await expectAsync(render(App)).toBeRejectedWithError(
        /NG0320: The `\(attr\.role\)` handler passed a function to/,
      );
    });
  }

  describe('in production mode', () => {
    const _global: {ngDevMode: unknown} = globalThis as any;
    let savedNgDevMode: unknown;
    beforeEach(() => {
      savedNgDevMode = _global.ngDevMode;
      _global.ngDevMode = false;
    });
    afterEach(() => (_global.ngDevMode = savedNgDevMode));

    it('applies the call to resolve() from an entry that resolve() reads', async () => {
      const fixture = await render(ReentrantApp);

      expect(fixture.nativeElement.querySelector('li').getAttribute('role')).toBe('inner');
    });

    it('applies the call to resolve() from a check of the value that resolve() makes', async () => {
      const fixture = await render(ProxyReentrantApp);

      expect(fixture.nativeElement.querySelector('li').getAttribute('role')).toBe('inner');
    });
  });
});

describe('provideAttributeResolvers in nested injectors and repeated calls', () => {
  const marking =
    (name: string) =>
    (...classes: string[]) =>
      [...classes, `by-${name}`].join(' ');

  @Component({
    selector: 'ui-menu',
    imports: [MenuItem],
    template: `<li
      menuItem
      role="separator"
      class="item"
      (class)="(cn) => cn()"
      (attr.role)="$event.resolve($event.resolver())"
    ></li>`,
    providers: [provideAttributeResolvers({role: joinValues('+')})],
  })
  class UiMenu {}

  it("takes a name that the nearest map doesn't have from the map above it", async () => {
    @Component({imports: [UiMenu], template: '<ui-menu />'})
    class App {}

    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({class: marking('root'), role: joinValues('-')})],
    });
    const fixture = await render(App);
    const li = fixture.nativeElement.querySelector('li');

    expect(li.className).toBe('item by-root');
    expect(li.getAttribute('role')).toBe('menuitem+separator');
  });

  it('lays the names of a later call in one injector over those of an earlier one', async () => {
    @Component({
      imports: [MenuItem],
      template: `<li
        menuItem
        role="separator"
        class="item"
        (class)="(cn) => cn()"
        (attr.role)="$event.resolve($event.resolver())"
      ></li>`,
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers({class: marking('first'), role: joinValues('-')}),
        provideAttributeResolvers({role: joinValues('+')}),
      ],
    });
    const fixture = await render(App);
    const li = fixture.nativeElement.querySelector('li');

    expect(li.className).toBe('item by-first');
    expect(li.getAttribute('role')).toBe('menuitem+separator');
  });

  it("keeps the resolvers that the map holds when it's called, whatever the map holds later", async () => {
    @Component({
      imports: [MenuItem],
      template: `<li
        menuItem
        role="separator"
        (attr.role)="$event.resolve($event.resolver())"
      ></li>`,
    })
    class App {}

    const resolvers: {[name: string]: AttributeResolver | undefined} = {role: joinValues('-')};
    TestBed.configureTestingModule({providers: [provideAttributeResolvers(resolvers)]});
    resolvers['role'] = joinValues('+');
    resolvers['data-labels'] = joinValues('+');
    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('li').getAttribute('role')).toBe(
      'menuitem-separator',
    );
  });
});

describe('provideAttributeResolvers with the key of an event handler attribute', () => {
  it('throws in dev mode', () => {
    expect(() => provideAttributeResolvers({onclick: lastValue})).toThrowError(
      /`provideAttributeResolvers` can't resolve the `onclick` attribute/,
    );
    expect(() => provideAttributeResolvers({onClick: lastValue})).toThrowError(
      /can't resolve the `onClick` attribute/,
    );
  });
});

describe('built-in attribute resolvers', () => {
  it('lastValue returns the last value, or null for none', () => {
    expect(lastValue('a', 'b')).toBe('b');
    expect(lastValue()).toBeNull();
  });

  it('joinTokens drops repeated tokens, keeping the first, and splits on ASCII whitespace', () => {
    expect(joinTokens('b', 'a b', '', '\tc\n', 'a')).toBe('b a c');
    expect(joinTokens()).toBe('');
  });

  it('joinValues joins with its separator, keeping repeated values, or returns null for none', () => {
    expect(joinValues(' / ')('a', 'b', 'a')).toBe('a / b / a');
    expect(joinValues(', ')()).toBeNull();
  });
});
