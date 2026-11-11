/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  afterNextRender,
  Component,
  Directive,
  ElementRef,
  inject,
  provideAttributeResolvers,
  Renderer2,
  RendererStyleFlags2,
  ResolvedAttribute,
  signal,
  Type,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

/** `$event` of an `(attr.style)` binding. */
interface StyleResolveEvent {
  readonly sources: readonly [
    component: readonly string[],
    directives: readonly string[],
    template: readonly string[],
  ];
  resolver(...extras: unknown[]): ResolvedAttribute;
  resolve(value: string | readonly string[] | ResolvedAttribute | null): void;
}

/** What the server writes for the component in "give the values that the browser reads". */
const SERVER_HTML = '<div style="padding-left: 2px; padding: 4px;"></div>';

/**
 * What the server writes for the component in "give the values that the browser reads from the
 * server's HTML for a constructor's style".
 */
const CONSTRUCTOR_SERVER_HTML =
  '<div style="outline: 1px solid red; padding-left: 2px; padding: 4px;"></div>';

async function render<T>(component: Type<T>) {
  const fixture = TestBed.createComponent(component);
  await fixture.whenStable();
  return fixture;
}

describe('resolved styles', () => {
  it("apply a template's longhand after a component's shorthand", async () => {
    @Component({selector: 'ui-box', host: {'[style]': '{padding: "4px"}'}, template: ''})
    class UiBox {}

    @Component({
      imports: [UiBox],
      template: `<ui-box [style]="{'padding-left': '2px'}" (style)="(merge) => merge()" />`,
    })
    class App {}

    const fixture = await render(App);

    const box: HTMLElement = fixture.nativeElement.querySelector('ui-box');
    expect(box.style.paddingLeft).toBe('2px');
    expect(box.style.paddingTop).toBe('4px');
  });

  describe("keep the template's padding-left when the component's padding goes null", () => {
    async function renderPadded(longhandFirst: boolean) {
      const padding = signal<string | null>('4px');

      @Component({selector: 'ui-box', host: {'[style.padding]': 'padding()'}, template: ''})
      class UiBox {
        readonly padding = padding;
      }

      @Component({
        imports: [UiBox],
        template: `<ui-box [style.padding-left]="'2px'" (attr.style)="resolveIn($event)" />`,
      })
      class App {
        resolveIn(event: StyleResolveEvent) {
          event.resolve(longhandFirst ? [...event.sources.flat()].reverse() : event.resolver());
        }
      }

      const fixture = await render(App);
      const box: HTMLElement = fixture.nativeElement.querySelector('ui-box');
      return {fixture, box, padding};
    }

    it('with the shorthand first', async () => {
      const {fixture, box, padding} = await renderPadded(false);
      expect(box.style.paddingLeft).toBe('2px');
      expect(box.style.paddingTop).toBe('4px');

      padding.set(null);
      await fixture.whenStable();

      expect(box.style.paddingLeft).toBe('2px');
      expect(box.style.paddingTop).toBe('');
    });

    it('with the longhand first', async () => {
      const {fixture, box, padding} = await renderPadded(true);
      expect(box.style.paddingLeft).toBe('4px');
      expect(box.style.paddingTop).toBe('4px');

      padding.set(null);
      await fixture.whenStable();

      expect(box.style.paddingLeft).toBe('2px');
      expect(box.style.paddingTop).toBe('');
    });
  });

  it('keep a longhand when a shorthand is inserted before it', async () => {
    const padding = signal<string | null>(null);

    @Component({selector: 'ui-box', host: {'[style.padding]': 'padding()'}, template: ''})
    class UiBox {
      readonly padding = padding;
    }

    @Component({
      imports: [UiBox],
      template: `<ui-box [style.padding-left]="'2px'" (style)="(merge) => merge()" />`,
    })
    class App {}

    const fixture = await render(App);
    const box: HTMLElement = fixture.nativeElement.querySelector('ui-box');
    expect(box.style.paddingLeft).toBe('2px');

    padding.set('8px');
    await fixture.whenStable();

    expect(box.style.paddingLeft).toBe('2px');
    expect(box.style.paddingTop).toBe('8px');
  });

  it('apply again in the new order when the declarations are reordered', async () => {
    @Component({selector: 'ui-box', host: {'[style.padding]': "'4px'"}, template: ''})
    class UiBox {}

    @Component({
      imports: [UiBox],
      template: `<ui-box [style.padding-left]="'2px'" (attr.style)="resolveIn($event)" />`,
    })
    class App {
      readonly longhandFirst = signal(false);

      resolveIn(event: StyleResolveEvent) {
        const declarations = event.sources.flat();
        event.resolve(this.longhandFirst() ? [...declarations].reverse() : declarations);
      }
    }

    const fixture = await render(App);
    const box: HTMLElement = fixture.nativeElement.querySelector('ui-box');
    expect(box.style.paddingLeft).toBe('2px');

    fixture.componentInstance.longhandFirst.set(true);
    await fixture.whenStable();

    expect(box.style.paddingLeft).toBe('4px');
  });

  it('keep a style that a constructor set with Renderer2 across refreshes', async () => {
    @Directive({selector: '[outlined]'})
    class Outlined {
      constructor() {
        inject(Renderer2).setStyle(inject(ElementRef).nativeElement, 'outline', '1px solid red');
      }
    }

    @Component({
      imports: [Outlined],
      template: `<div outlined [style.padding]="padding()" (style)="(merge) => merge()"></div>`,
    })
    class App {
      readonly padding = signal<string | null>('4px');
    }

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.style.outlineWidth).toBe('1px');

    fixture.componentInstance.padding.set('8px');
    await fixture.whenStable();
    fixture.componentInstance.padding.set(null);
    await fixture.whenStable();

    expect(div.style.paddingTop).toBe('');
    expect(div.style.outlineWidth).toBe('1px');
    expect(div.style.outlineStyle).toBe('solid');
  });

  describe('keep an outside longhand under a shorthand that stays the same', () => {
    it('set with el.style.setProperty when an earlier declaration is removed', async () => {
      @Component({template: `<div (attr.style)="$event.resolve(styles())"></div>`})
      class App {
        readonly styles = signal('color: red; padding: 4px');
      }

      const fixture = await render(App);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      div.style.setProperty('padding-left', '9px', 'important');

      fixture.componentInstance.styles.set('padding: 4px');
      await fixture.whenStable();

      expect(div.style.color).toBe('');
      expect(div.style.paddingTop).toBe('4px');
      expect(div.style.paddingLeft).toBe('9px');
      expect(div.style.getPropertyPriority('padding-left')).toBe('important');
    });

    it('set with Renderer2.setStyle when an earlier declaration changes', async () => {
      @Component({template: `<div (attr.style)="$event.resolve(styles())"></div>`})
      class App {
        readonly styles = signal('color: red; padding: 4px');
      }

      const fixture = await render(App);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      fixture.debugElement.injector
        .get(Renderer2)
        .setStyle(div, 'padding-left', '9px', RendererStyleFlags2.DashCase);

      fixture.componentInstance.styles.set('color: blue; padding: 4px');
      await fixture.whenStable();

      expect(div.style.color).toBe('blue');
      expect(div.style.paddingTop).toBe('4px');
      expect(div.style.paddingLeft).toBe('9px');
    });

    it('set after rendering, as an animation sets it, when a declaration is inserted', async () => {
      @Directive({selector: '[nudged]'})
      class Nudged {
        constructor() {
          const element: HTMLElement = inject(ElementRef).nativeElement;
          afterNextRender(() => {
            element.style.marginTop = '9px';
          });
        }
      }

      @Component({
        imports: [Nudged],
        template: `<div nudged (attr.style)="$event.resolve(styles())"></div>`,
      })
      class App {
        readonly styles = signal('margin: 4px');
      }

      const fixture = await render(App);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      expect(div.style.marginTop).toBe('9px');

      fixture.componentInstance.styles.set('color: blue; margin: 4px');
      await fixture.whenStable();

      expect(div.style.color).toBe('blue');
      expect(div.style.marginLeft).toBe('4px');
      expect(div.style.marginTop).toBe('9px');
    });
  });

  it("let a removed longhand fall back to an earlier shorthand's value", async () => {
    @Component({template: `<div (attr.style)="$event.resolve(styles())"></div>`})
    class App {
      readonly styles = signal('padding: 4px; padding-left: 2px; color: red');
    }

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.style.paddingLeft).toBe('2px');

    fixture.componentInstance.styles.set('padding: 4px; color: red');
    await fixture.whenStable();

    expect(div.style.paddingLeft).toBe('4px');
    expect(div.style.paddingTop).toBe('4px');
  });

  describe('apply again a declaration whose longhands a changed one shares', () => {
    async function restyle(first: string, second: string) {
      @Component({template: `<div (attr.style)="$event.resolve(styles())"></div>`})
      class App {
        readonly styles = signal(first);
      }

      const fixture = await render(App);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      fixture.componentInstance.styles.set(second);
      await fixture.whenStable();
      return div;
    }

    it('for a side shorthand that changes before border-width', async () => {
      const div = await restyle(
        'border-top: 1px solid red; border-width: 5px',
        'border-top: 2px solid red; border-width: 5px',
      );

      expect(div.style.borderTopWidth).toBe('5px');
    });

    it('for a side shorthand that is removed before border-width', async () => {
      const div = await restyle(
        'border-top: 1px solid red; border-width: 5px',
        'border-width: 5px',
      );

      expect(div.style.borderTopWidth).toBe('5px');
    });

    it('for border-width that changes before a side shorthand', async () => {
      const div = await restyle(
        'border-width: 5px; border-top: 1px solid red',
        'border-width: 6px; border-top: 1px solid red',
      );

      expect(div.style.borderTopWidth).toBe('1px');
      expect(div.style.borderLeftWidth).toBe('6px');
    });

    it('for border-width that is removed before a side shorthand', async () => {
      const div = await restyle(
        'border-width: 5px; border-top: 1px solid red',
        'border-top: 1px solid red',
      );

      expect(div.style.borderTopWidth).toBe('1px');
      expect(div.style.borderLeftWidth).toBe('');
    });

    it('for a logical longhand after border-inline-width that changes', async () => {
      const div = await restyle(
        'border-inline-width: 4px; border-inline-start-width: 2px',
        'border-inline-width: 8px; border-inline-start-width: 2px',
      );

      expect(div.style.borderInlineStartWidth).toBe('2px');
      expect(div.style.borderInlineEndWidth).toBe('8px');
    });

    it('for a logical longhand after border-inline-width that is removed', async () => {
      const div = await restyle(
        'border-inline-width: 4px; border-inline-start-width: 2px',
        'border-inline-start-width: 2px',
      );

      expect(div.style.borderInlineStartWidth).toBe('2px');
      expect(div.style.borderInlineEndWidth).toBe('');
    });

    it('for border-inline-width after a logical longhand that is removed', async () => {
      const div = await restyle(
        'border-inline-start-width: 2px; border-inline-width: 4px',
        'border-inline-width: 4px',
      );

      expect(div.style.borderInlineStartWidth).toBe('4px');
      expect(div.style.borderInlineEndWidth).toBe('4px');
    });
  });

  describe("don't apply again a shorthand that only shares a prefix with a changed property", () => {
    async function restyleAround(
      first: string,
      outside: [property: string, value: string],
      second: string,
    ) {
      @Component({template: `<div (attr.style)="$event.resolve(styles())"></div>`})
      class App {
        readonly styles = signal(first);
      }

      const fixture = await render(App);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      div.style.setProperty(outside[0], outside[1], 'important');
      fixture.componentInstance.styles.set(second);
      await fixture.whenStable();
      return div;
    }

    it('for outline, which outline-offset is no part of', async () => {
      const div = await restyleAround(
        'outline-offset: 4px; outline: 1px solid red',
        ['outline-color', 'blue'],
        'outline: 1px solid red',
      );

      expect(div.style.outlineOffset).toBe('');
      expect(div.style.outlineColor).toBe('blue');
      expect(div.style.getPropertyPriority('outline-color')).toBe('important');
    });

    it('for border, which border-radius is no part of', async () => {
      const div = await restyleAround(
        'border: 1px solid red; border-radius: 4px',
        ['border-top-color', 'blue'],
        'border: 1px solid red',
      );

      expect(div.style.borderTopLeftRadius).toBe('');
      expect(div.style.borderTopColor).toBe('blue');
    });

    it('for flex, which flex-flow is no part of', async () => {
      const div = await restyleAround(
        'flex-flow: row wrap; flex: 1 1 0px',
        ['flex-grow', '3'],
        'flex: 1 1 0px',
      );

      expect(div.style.flexWrap).toBe('');
      expect(div.style.flexGrow).toBe('3');
    });
  });

  it("give the values that the browser reads from the server's HTML", async () => {
    // The same component as in `style_resolver_hydration_spec.ts`, which checks that the server
    // writes `SERVER_HTML`.
    @Component({
      template: `<div
        style="padding: 4px; padding-left: 2px"
        (attr.style)="$event.resolve(['padding-left: 2px', 'padding: 4px'])"
      ></div>`,
    })
    class App {}

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    const parsed = document.createElement('section');
    parsed.innerHTML = SERVER_HTML;
    const serverDiv = parsed.querySelector('div')!;

    expect(div.style.paddingLeft).toBe('4px');
    for (const property of ['padding-top', 'padding-right', 'padding-bottom', 'padding-left']) {
      expect(serverDiv.style.getPropertyValue(property))
        .withContext(property)
        .toBe(div.style.getPropertyValue(property));
    }
  });

  it("give the values that the browser reads from the server's HTML for a constructor's style", async () => {
    // The same component as in `style_resolver_hydration_spec.ts`, which checks that the server
    // writes `CONSTRUCTOR_SERVER_HTML`.
    @Directive({selector: '[padded]'})
    class Padded {
      constructor() {
        const renderer = inject(Renderer2);
        const element = inject(ElementRef).nativeElement;
        renderer.setStyle(element, 'outline', '1px solid red');
        renderer.setStyle(element, 'padding', '4px');
      }
    }

    @Component({
      imports: [Padded],
      template: `<div
        padded
        (attr.style)="$event.resolve(['padding-left: 2px', 'padding: 4px'])"
      ></div>`,
    })
    class App {}

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    const parsed = document.createElement('section');
    parsed.innerHTML = CONSTRUCTOR_SERVER_HTML;
    const serverDiv = parsed.querySelector('div')!;

    expect(div.style.paddingLeft).toBe('4px');
    expect(div.style.outlineWidth).toBe('1px');
    for (const property of [
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'outline-width',
    ]) {
      expect(serverDiv.style.getPropertyValue(property))
        .withContext(property)
        .toBe(div.style.getPropertyValue(property));
    }
  });

  describe("give the values that the browser reads from the server's HTML when a later resolution takes over a constructor's style", () => {
    // The same components as in `style_resolver_hydration_spec.ts`, which checks that the server
    // writes `serverHtml`.
    async function expectServerValues(
      constructorStyle: string,
      first: string[],
      second: string[],
      serverHtml: string,
    ) {
      @Directive({selector: '[styled]'})
      class Styled {
        constructor() {
          const [property, value] = constructorStyle.split(': ');
          inject(Renderer2).setStyle(inject(ElementRef).nativeElement, property, value);
        }
      }

      @Component({
        imports: [Styled],
        template: `<div styled (attr.style)="$event.resolve(declarations())"></div>`,
      })
      class App implements AfterViewInit {
        readonly declarations = signal(first);

        ngAfterViewInit(): void {
          this.declarations.set(second);
        }
      }

      const fixture = await render(App);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      const parsed = document.createElement('section');
      parsed.innerHTML = serverHtml;
      const serverDiv = parsed.querySelector('div')!;

      for (const property of ['padding-top', 'padding-right', 'padding-bottom', 'padding-left']) {
        expect(serverDiv.style.getPropertyValue(property))
          .withContext(property)
          .toBe(div.style.getPropertyValue(property));
      }
      return div;
    }

    it('for a shorthand after the longhand that the first resolution set', async () => {
      const div = await expectServerValues(
        'padding: 4px',
        ['padding-left: 2px'],
        ['padding-left: 2px', 'padding: 4px'],
        '<div style="padding-left: 2px; padding: 4px;"></div>',
      );

      expect(div.style.paddingLeft).toBe('4px');
    });

    it('for a longhand after the shorthand that the first resolution set', async () => {
      const div = await expectServerValues(
        'padding-left: 2px',
        ['padding: 4px'],
        ['padding: 4px', 'padding-left: 2px'],
        '<div style="padding: 4px; padding-left: 2px;"></div>',
      );

      expect(div.style.paddingLeft).toBe('2px');
      expect(div.style.paddingTop).toBe('4px');
    });
  });

  it("let a component's `color: red !important` beat the template's `color: blue`", async () => {
    @Component({selector: 'ui-box', host: {style: 'color: red !important'}, template: ''})
    class UiBox {}

    // The template's declaration reaches the result through `merge()`, since collecting the
    // sources already drops a declaration that an earlier important one beats.
    @Component({
      imports: [UiBox],
      template: `<ui-box (style)="(merge) => merge({color: 'blue'})" />`,
    })
    class App {}

    const fixture = await render(App);

    const box: HTMLElement = fixture.nativeElement.querySelector('ui-box');
    expect(box.style.color).toBe('red');
    expect(box.style.getPropertyPriority('color')).toBe('important');
  });

  describe("rank `merge({color: 'red'})` in the caller's source", () => {
    it('for the template', async () => {
      @Component({
        selector: 'ui-box',
        host: {'[style.padding-left]': "'2px'"},
        template: '',
      })
      class UiBox {}

      @Component({
        imports: [UiBox],
        template: `<ui-box
          style="color: blue"
          (style)="(merge) => merge({color: 'red', padding: '4px'})"
        />`,
      })
      class App {}

      const fixture = await render(App);

      const box: HTMLElement = fixture.nativeElement.querySelector('ui-box');
      expect(box.style.color).toBe('red');
      expect(box.style.paddingLeft).toBe('4px');
    });

    it('for a component', async () => {
      @Component({
        selector: 'ui-box',
        host: {'(style)': 'resolve'},
        template: '',
      })
      class UiBox {
        protected readonly resolve = (merge: StyleResolveEvent['resolver']) =>
          merge({color: 'red', padding: '4px'});
      }

      @Component({
        imports: [UiBox],
        template: `<ui-box style="color: blue" [style.padding-left]="'2px'" />`,
      })
      class App {}

      const fixture = await render(App);

      const box: HTMLElement = fixture.nativeElement.querySelector('ui-box');
      expect(box.style.color).toBe('blue');
      expect(box.style.paddingLeft).toBe('2px');
      expect(box.style.paddingTop).toBe('4px');
    });
  });

  it('apply vendor aliases and cssFloat under the names that CSS uses', async () => {
    @Component({
      template: `
        <div
          id="map"
          [style]="{WebkitTransform: 'translateX(1px)', cssFloat: 'left'}"
          (style)="(merge) => merge()"
        ></div>
        <div
          id="property"
          [style.WebkitTransform]="'translateX(2px)'"
          [style.cssFloat]="'right'"
          (style)="(merge) => merge()"
        ></div>
      `,
    })
    class App {}

    const fixture = await render(App);

    const map: HTMLElement = fixture.nativeElement.querySelector('#map');
    expect(map.style.transform).toBe('translateX(1px)');
    expect(map.style.cssFloat).toBe('left');
    const property: HTMLElement = fixture.nativeElement.querySelector('#property');
    expect(property.style.transform).toBe('translateX(2px)');
    expect(property.style.cssFloat).toBe('right');
  });

  it("apply an app resolver's result under the names that CSS uses", async () => {
    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({style: () => 'COLOR: red; Padding-Left: 2px'})],
    });

    @Component({template: `<div style="color: blue" (style)="(merge) => merge()"></div>`})
    class App {}

    const fixture = await render(App);

    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.style.color).toBe('red');
    expect(div.style.paddingLeft).toBe('2px');
  });

  it('apply an empty custom property, which var() substitutes without its fallback', async () => {
    @Component({
      template: `
        <section style="color: blue">
          <p
            id="empty"
            [attr.style]="'--x: ; color: var(--x, red)'"
            (style)="(merge) => merge()"
          ></p>
          <p id="absent" [attr.style]="'color: var(--x, red)'" (style)="(merge) => merge()"></p>
        </section>
      `,
    })
    class App {}

    const fixture = await render(App);

    // `color` is invalid at computed-value time when `--x` is empty, so it inherits blue.
    const color = (id: string) => getComputedStyle(fixture.nativeElement.querySelector(id)).color;
    expect(color('#empty')).toBe('rgb(0, 0, 255)');
    expect(color('#absent')).toBe('rgb(255, 0, 0)');
  });
});
