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
  ClassResolveEvent,
  ClassSources,
  Component,
  Directive,
  HostListener,
  inject,
  joinDeclarations,
  provideAttributeResolvers,
  Renderer2,
  RendererStyleFlags2,
  ResolvedAttribute,
  signal,
  Type,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {clearTranslations} from '@angular/localize';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {isNode} from '@angular/private/testing';

type StyleValue = string | readonly string[] | {readonly [property: string]: unknown};

/** `$event` of an `(attr.style)` binding. */
interface StyleResolveEvent {
  readonly sources: readonly [
    component: readonly string[],
    directives: readonly string[],
    template: readonly string[],
  ];
  resolver(...extras: Array<StyleValue | null | undefined>): ResolvedAttribute;
  resolve(value: StyleValue | ResolvedAttribute | null): void;
}

type BoundStyleResolver = StyleResolveEvent['resolver'];

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

function styleOf(element: HTMLElement, property: string): string {
  return element.style.getPropertyValue(property);
}

function spyOnWrites(renderer: Renderer2, element: Element): () => string[] {
  let writes: string[] = [];
  const methods = [
    'setAttribute',
    'removeAttribute',
    'setProperty',
    'addClass',
    'removeClass',
    'setStyle',
    'removeStyle',
  ] as const;
  for (const method of methods) {
    spyOn(renderer, method).and.callFake(function (this: Renderer2, el: unknown, ...args: any[]) {
      if (el === element) {
        writes.push(`${method}(${args.join(', ')})`);
      }
      return (Object.getPrototypeOf(renderer)[method] as Function).call(this, el, ...args);
    });
  }
  return () => {
    const recorded = writes;
    writes = [];
    return recorded;
  };
}

describe('(attr.style) binding', () => {
  it('receives the declarations of each source in priority order', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {
        style: 'margin-top: 1px',
        '[style]': 'map()',
        '[style.width.px]': 'width()',
        '[attr.style]': 'attr()',
      },
    })
    class UiBox {
      readonly map = signal<{[property: string]: unknown}>({'padding-left': '2px', opacity: 0});
      readonly width = signal<number | null>(0);
      readonly attr = signal<string | null>('border-top-width: 3px');
    }

    @Directive({
      selector: '[placed]',
      host: {style: 'top: 5px', '[style.top]': 'undefined', '[style.left.px]': 'null'},
    })
    class Placed {}

    @Component({
      imports: [UiBox, Placed],
      template: `
        <ui-box
          placed
          style="left: 6px; color: blue"
          [style]="{color: null}"
          [style.margin-top.px]="8"
          [attr.style]="'right: 7px'"
          (attr.style)="capture($event)"
        />
      `,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      ['opacity: 0', 'padding-left: 2px', 'width: 0px', 'border-top-width: 3px'],
      ['top: 5px'],
      ['left: 6px', 'margin-top: 8px', 'right: 7px'],
    ]);
    const box = fixture.nativeElement.querySelector('ui-box');
    expect(styleOf(box, 'opacity')).toBe('0');
    expect(styleOf(box, 'width')).toBe('0px');
    expect(styleOf(box, 'margin-top')).toBe('8px');
    expect(styleOf(box, 'border-top-width')).toBe('3px');
    expect(styleOf(box, 'color')).toBe('');
  });

  it('collects the declarations again when a binding changes', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {'[style.width.px]': 'width()', '[attr.style]': 'attr()'},
    })
    class UiBox {
      readonly width = signal<number | null | undefined>(10);
      readonly attr = signal<string | null>('height: 1px');
    }

    @Component({
      imports: [UiBox],
      template: `<ui-box style="color: blue" (attr.style)="capture($event)" />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);
    const box: HTMLElement = fixture.nativeElement.querySelector('ui-box');
    const uiBox = fixture.debugElement.children[0].injector.get(UiBox);
    expect(fixture.componentInstance.sources).toEqual([
      ['width: 10px', 'height: 1px'],
      [],
      ['color: blue'],
    ]);
    expect(styleOf(box, 'width')).toBe('10px');

    uiBox.width.set(0);
    uiBox.attr.set(null);
    await fixture.whenStable();

    expect(fixture.componentInstance.sources).toEqual([['width: 0px'], [], ['color: blue']]);
    expect(styleOf(box, 'width')).toBe('0px');
    expect(styleOf(box, 'height')).toBe('');
  });

  it("keeps a component's important declaration over the template's later one", async () => {
    @Component({selector: 'ui-box', template: '', host: {style: 'color: red !important'}})
    class UiBox {}

    @Component({
      imports: [UiBox],
      template: `<ui-box style="color: blue" (attr.style)="capture($event)" />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([['color: red !important'], [], []]);
    expect(styleOf(fixture.nativeElement.querySelector('ui-box'), 'color')).toBe('red');
  });

  it("keeps a component's important declaration over the template's later removal", async () => {
    @Component({selector: 'ui-box', template: '', host: {style: 'color: red !important'}})
    class UiBox {}

    @Component({
      imports: [UiBox],
      template: `<ui-box [style.color]="null" (attr.style)="capture($event)" />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([['color: red !important'], [], []]);
    expect(styleOf(fixture.nativeElement.querySelector('ui-box'), 'color')).toBe('red');
  });

  it('merges an extra with more declarations than a call takes arguments', async () => {
    @Component({
      template: `<div
        (attr.style)="$event.resolver(declarations); $event.resolve('color: red')"
      ></div>`,
    })
    class App {
      readonly declarations = Array.from({length: 200_000}, (_, i) => `--p${i}: 1`).join('; ');
    }

    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('div').style.color).toBe('red');
  });

  it('lets a later important declaration replace an earlier important one', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {style: 'color: red !important', '[style.width]': "'1px !important'"},
    })
    class UiBox {}

    @Component({
      imports: [UiBox],
      template: `<ui-box
        [style.color]="'blue !important'"
        [style.width]="'2px'"
        (attr.style)="capture($event)"
      />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      ['width: 1px !important'],
      [],
      ['color: blue !important'],
    ]);
  });

  it('recognizes importance written with spaces, in any case, or before whitespace', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {style: 'color: red ! IMPORTANT', '[style.width]': "'1px !important  '"},
    })
    class UiBox {}

    @Component({
      imports: [UiBox],
      template: `<ui-box
        style="color: blue"
        [style.width]="'2px'"
        (attr.style)="capture($event)"
      />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      ['color: red !important', 'width: 1px !important'],
      [],
      [],
    ]);
  });

  it('keeps an earlier important declaration of a [style] string over a later one', async () => {
    @Component({
      template: `<div
        [style]="'color: red !important; color: blue'"
        (attr.style)="capture($event)"
      ></div>`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([[], [], ['color: red !important']]);
  });

  it('writes property names in dash case and lowercase, except custom properties', async () => {
    @Component({
      template: `<div
        [style]="{fontSize: '10px', '--brandColor': 'Blue'}"
        [style.fontSize]="'20px'"
        [attr.style]="'COLOR: red; --Space: 4px'"
        (attr.style)="capture($event)"
      ></div>`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      [],
      ['--brandColor: Blue', 'font-size: 20px', 'color: red', '--Space: 4px'],
    ]);
  });

  it('reads the static declarations of every instance of an element the same way', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {
        style: String.raw`cssFloat: left; COLOR: red !IMPORTANT; \74 op: 5px; --Gap: 1px; left: `,
      },
    })
    class UiBox {}

    @Component({
      imports: [UiBox],
      template: `
        @for (width of widths(); track $index) {
          <ui-box
            style="color: blue"
            [style.width.px]="width"
            (attr.style)="capture($index, $event)"
          />
        }
      `,
    })
    class App {
      readonly widths = signal([1, 2]);
      readonly sources: Array<StyleResolveEvent['sources']> = [];

      capture(index: number, event: StyleResolveEvent) {
        this.sources[index] = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);
    fixture.componentInstance.widths.set([3, 2]);
    await fixture.whenStable();

    const statics = ['float: left', 'color: red !important', 'top: 5px', '--gap: 1px'];
    expect(fixture.componentInstance.sources).toEqual([
      [statics, [], ['width: 3px']],
      [statics, [], ['width: 2px']],
    ]);
    for (const box of fixture.nativeElement.querySelectorAll('ui-box')) {
      expect(styleOf(box, 'color')).toBe('red');
      expect(box.style.getPropertyPriority('color')).toBe('important');
    }
  });

  it('reads [attr.style] declarations with comments, non-ASCII names, and blocks', async () => {
    @Component({
      template: `<div [attr.style]="css" (attr.style)="capture($event)"></div>`,
    })
    class App {
      readonly css =
        '/* theme */ color: red; --é: 1px; --grid: {a: 1; b: 2}; ' +
        'content: \'a;b\'; background: url("c;d") /* end */';
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      [],
      [
        'color: red',
        '--é: 1px',
        '--grid: {a: 1; b: 2}',
        "content: 'a;b'",
        'background: url("c;d")',
      ],
    ]);
  });

  it('writes vendor aliases and cssFloat under the names that CSS uses', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {
        '[style]': "{WebkitTransform: 'scale(1)', MozTransform: 'scale(2)', cssFloat: 'left'}",
      },
    })
    class UiBox {}

    @Component({
      imports: [UiBox],
      template: `<ui-box
        [style]="{webkitTransform: 'scale(3)', msTransform: 'scale(4)'}"
        [style.WebkitTransform]="'scale(5)'"
        [style.cssFloat]="'right'"
        [attr.style]="'-moz-transform: scale(6); ms-transform: scale(7)'"
        (attr.style)="capture($event)"
      />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      [],
      [
        '-webkit-transform: scale(5)',
        'float: right',
        '-moz-transform: scale(6)',
        '-ms-transform: scale(7)',
      ],
    ]);
  });

  it('decodes escapes in property names', async () => {
    @Component({
      template: `<div [attr.style]="css" (attr.style)="capture($event)"></div>`,
    })
    class App {
      readonly css = String.raw`\63 olor: red; --\62 rand: \62 lue; \66ont-size: 1px`;
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      [],
      ['color: red', String.raw`--brand: \62 lue`, 'font-size: 1px'],
    ]);
  });

  it('writes decoded property names as CSS identifiers', async () => {
    @Component({
      template: `<div [attr.style]="css" (attr.style)="capture($event)"></div>`,
    })
    class App {
      readonly css = String.raw`--x\3b color: red; --a\:b: 1px; width: 2px`;
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      [],
      [String.raw`--x\;color: red`, String.raw`--a\:b: 1px`, 'width: 2px'],
    ]);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(styleOf(div, 'width')).toBe('2px');
    if (!isNode) {
      // Domino doesn't escape names when it writes the `style` attribute.
      expect(styleOf(div, 'color')).toBe('');
      expect(styleOf(div, '--x;color')).toBe('red');
    }
  });

  it('completes a backslash at the end of a value before joining declarations', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {'[attr.style]': 'css'},
    })
    class UiBox {
      readonly css = '--x: abc\\';
    }

    @Component({
      imports: [UiBox],
      template: `
        <ui-box [style.width]="'2px'" (attr.style)="capture($event)" />
        <p (attr.style)="$event.resolve(['--y: abc\\\\', 'height: 3px'])"></p>
      `,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    // A browser reads an escape at the end of the input as U+FFFD.
    expect(fixture.componentInstance.sources).toEqual([['--x: abc\ufffd'], [], ['width: 2px']]);
    expect(styleOf(fixture.nativeElement.querySelector('ui-box'), 'width')).toBe('2px');
    expect(styleOf(fixture.nativeElement.querySelector('p'), 'height')).toBe('3px');
  });

  it('trims only CSS whitespace around property names', async () => {
    @Component({
      template: `<div [attr.style]="css" (attr.style)="capture($event)"></div>`,
    })
    class App {
      readonly css = '--x\u00a0: red; --x: blue; ' + String.raw`--y\ : 1px`;
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      [],
      ['--x\u00a0: red', '--x: blue', String.raw`--y\ : 1px`],
    ]);
  });

  it('reads importance from the last tokens of a value', async () => {
    @Component({
      template: `<div [attr.style]="css" (attr.style)="capture($event)"></div>`,
    })
    class App {
      readonly css =
        '--tone: red !important /*note*/; --tone: blue; ' +
        String.raw`--x: \!important; --x: green; ` +
        "content: '!important'; color: red ! /* a */ important";
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      [],
      ['--tone: red !important', '--x: green', "content: '!important'", 'color: red !important'],
    ]);
  });

  it('keeps comment delimiters inside an unquoted url()', async () => {
    @Component({
      template: `<div [attr.style]="css" (attr.style)="capture($event)"></div>`,
    })
    class App {
      readonly css =
        'background-image: URL(/images/*theme*/icon.svg); ' +
        String.raw`mask-image: url(/a\)b;c.svg) /* end */`;
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      [],
      ['background-image: URL(/images/*theme*/icon.svg)', String.raw`mask-image: url(/a\)b;c.svg)`],
    ]);
  });

  it('keeps an empty custom property and drops an empty ordinary one', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {
        '[attr.style]': "'--x: ; --y:; color: ; width: 1px'",
        '(attr.style)': 'resolve($event)',
      },
    })
    class UiBox {
      resolve(event: StyleResolveEvent) {
        event.resolve(event.resolver());
      }
    }

    @Component({
      imports: [UiBox],
      template: `<ui-box [style]="{'--z': ''}" (attr.style)="capture($event)" />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    // The component's result folds back into its own source, and `''` still removes `--z`.
    expect(fixture.componentInstance.sources).toEqual([['--x: ', '--y: ', 'width: 1px'], [], []]);
  });

  it('reads a trusted style in [attr.style]', async () => {
    @Component({
      template: `<div [attr.style]="css" (attr.style)="capture($event)"></div>`,
    })
    class App {
      readonly css: SafeStyle = inject(DomSanitizer).bypassSecurityTrustStyle('color: red');
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([[], [], ['color: red']]);
    expect(styleOf(fixture.nativeElement.querySelector('div'), 'color')).toBe('red');
  });

  it('applies only the resolved declarations', async () => {
    @Component({
      template: `<div
        style="color: red"
        [style.width.px]="1"
        [attr.style]="'height: 2px'"
        (attr.style)="$event.resolve('padding-left: 4px')"
      ></div>`,
    })
    class App {}

    const fixture = await render(App);

    const div = fixture.nativeElement.querySelector('div');
    expect(styleOf(div, 'padding-left')).toBe('4px');
    expect(styleOf(div, 'color')).toBe('');
    expect(styleOf(div, 'width')).toBe('');
    expect(styleOf(div, 'height')).toBe('');
  });

  it('removes the declarations that a later resolution drops and keeps outside styles', async () => {
    @Component({
      template: `<div [style.width.px]="width()" (attr.style)="resolveWith($event)"></div>`,
    })
    class App {
      readonly width = signal<number | null>(1);
      readonly extra = signal<string | null>('height: 2px');

      resolveWith(event: StyleResolveEvent) {
        event.resolve(event.resolver(this.extra()));
      }
    }

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    fixture.debugElement.injector.get(Renderer2).setStyle(div, 'margin-left', '3px');
    expect(styleOf(div, 'width')).toBe('1px');
    expect(styleOf(div, 'height')).toBe('2px');

    fixture.componentInstance.width.set(null);
    fixture.componentInstance.extra.set(null);
    await fixture.whenStable();

    expect(styleOf(div, 'width')).toBe('');
    expect(styleOf(div, 'height')).toBe('');
    expect(styleOf(div, 'margin-left')).toBe('3px');
  });

  it('removes every resolved declaration when it resolves null', async () => {
    @Component({
      template: `<div style="color: red" (attr.style)="$event.resolve(null)"></div>`,
    })
    class App {}

    const fixture = await render(App);

    expect(styleOf(fixture.nativeElement.querySelector('div'), 'color')).toBe('');
  });

  it('writes only the declarations that change and the ones that they overlap', async () => {
    @Component({template: `<div (attr.style)="$event.resolve(styles())"></div>`})
    class App {
      readonly renderer = inject(Renderer2);
      readonly styles = signal('color: red; padding: 4px; padding-left: 2px; margin: 1px');
    }

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    const writes = spyOnWrites(fixture.componentInstance.renderer, div);

    fixture.componentInstance.styles.set('color:red;padding:4px;padding-left:2px;margin:1px');
    await fixture.whenStable();
    expect(writes()).toEqual([]);

    fixture.componentInstance.styles.set('padding: 4px; padding-left: 2px; margin: 1px');
    await fixture.whenStable();
    expect(writes()).toEqual(['removeStyle(color, )']);

    fixture.componentInstance.styles.set('padding: 8px; padding-left: 2px; margin: 1px');
    await fixture.whenStable();
    expect(writes()).toEqual([
      'removeStyle(padding, )',
      'setStyle(padding, 8px, )',
      `removeStyle(padding-left, ${RendererStyleFlags2.DashCase})`,
      `setStyle(padding-left, 2px, ${RendererStyleFlags2.DashCase})`,
    ]);
  });

  describe('writes again a declaration after one that sets the same longhand and changes', () => {
    async function renderWithWrites(styles: string) {
      @Component({template: `<div (attr.style)="$event.resolve(styles())"></div>`})
      class App {
        readonly renderer = inject(Renderer2);
        readonly styles = signal(styles);
      }

      const fixture = await render(App);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      const writes = spyOnWrites(fixture.componentInstance.renderer, div);
      const resolve = async (next: string) => {
        fixture.componentInstance.styles.set(next);
        await fixture.whenStable();
        return writes();
      };
      return resolve;
    }

    const dashCase = RendererStyleFlags2.DashCase;

    it('for font-width, which font and its legacy alias font-stretch set', async () => {
      const resolve = await renderWithWrites('font: 12px serif; font-width: condensed');

      expect(await resolve('font: 14px serif; font-width: condensed')).toEqual([
        'removeStyle(font, )',
        'setStyle(font, 14px serif, )',
        `removeStyle(font-width, ${dashCase})`,
        `setStyle(font-width, condensed, ${dashCase})`,
      ]);
      expect(await resolve('font-stretch: expanded; font-width: condensed')).toEqual([
        'removeStyle(font, )',
        `removeStyle(font-stretch, ${dashCase})`,
        `setStyle(font-stretch, expanded, ${dashCase})`,
        `removeStyle(font-width, ${dashCase})`,
        `setStyle(font-width, condensed, ${dashCase})`,
      ]);
      expect(await resolve('font-stretch: semi-expanded; font-width: condensed')).toEqual([
        `removeStyle(font-stretch, ${dashCase})`,
        `setStyle(font-stretch, semi-expanded, ${dashCase})`,
        `removeStyle(font-width, ${dashCase})`,
        `setStyle(font-width, condensed, ${dashCase})`,
      ]);
    });

    it('for a longhand of timeline-trigger when timeline-trigger changes', async () => {
      const resolve = await renderWithWrites(
        'timeline-trigger: --t view(); timeline-trigger-active-range-start: 10%',
      );

      expect(
        await resolve('timeline-trigger: --t scroll(); timeline-trigger-active-range-start: 10%'),
      ).toEqual([
        `removeStyle(timeline-trigger, ${dashCase})`,
        `setStyle(timeline-trigger, --t scroll(), ${dashCase})`,
        `removeStyle(timeline-trigger-active-range-start, ${dashCase})`,
        `setStyle(timeline-trigger-active-range-start, 10%, ${dashCase})`,
      ]);
    });

    it('for a longhand of timeline-trigger-range when timeline-trigger-range is removed', async () => {
      const resolve = await renderWithWrites(
        'timeline-trigger-range: contain / cover; timeline-trigger-activation-range-end: 50%',
      );

      expect(await resolve('timeline-trigger-activation-range-end: 50%')).toEqual([
        `removeStyle(timeline-trigger-range, ${dashCase})`,
        `removeStyle(timeline-trigger-activation-range-end, ${dashCase})`,
        `setStyle(timeline-trigger-activation-range-end, 50%, ${dashCase})`,
      ]);
    });
  });

  if (isNode) {
    // Domino keeps a shorthand and its longhands as separate declarations and serializes them in
    // the order that they were first set, which is how a browser reads the server's HTML.
    it('serializes the declarations in the order that they resolve to', async () => {
      @Component({
        template: `<div
          style="padding: 4px; padding-left: 2px"
          (attr.style)="$event.resolve(declarations())"
        ></div>`,
      })
      class App {
        readonly declarations = signal(['padding-left: 2px', 'padding: 4px']);
      }

      const fixture = await render(App);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      const order = () =>
        div
          .getAttribute('style')!
          .split(';')
          .map((declaration) => declaration.split(':')[0].trim())
          .filter((property) => property !== '');
      expect(order()).toEqual(['padding-left', 'padding']);

      fixture.componentInstance.declarations.set(['padding: 4px', 'padding-left: 2px']);
      await fixture.whenStable();

      expect(order()).toEqual(['padding', 'padding-left']);
    });
  }

  it('reads extras and resolve() values the way a [style] binding reads them', async () => {
    const received: string[][] = [];
    const record: AttributeResolver = (...declarations) => {
      received.push(declarations);
      return declarations.join('; ');
    };
    TestBed.configureTestingModule({providers: [provideAttributeResolvers({style: record})]});

    @Component({
      template: `
        <div id="extras" style="color: red" (attr.style)="extras($event)"></div>
        <div
          id="map"
          style="width: 3px"
          (attr.style)="$event.resolve({'padding-left': '4px', width: null})"
        ></div>
        <div id="array" (attr.style)="$event.resolve(['height: 1px', 'top: 2px'])"></div>
      `,
    })
    class App {
      extras(event: StyleResolveEvent) {
        event.resolve(event.resolver({'margin-top': '1px', opacity: 0}, 'left: 2px; top: 3px'));
      }
    }

    const fixture = await render(App);

    expect(received).toEqual([
      ['color: red', 'margin-top: 1px', 'opacity: 0', 'left: 2px', 'top: 3px'],
    ]);
    const element = (id: string) => fixture.nativeElement.querySelector(`#${id}`);
    expect(styleOf(element('extras'), 'opacity')).toBe('0');
    expect(styleOf(element('map'), 'padding-left')).toBe('4px');
    expect(styleOf(element('map'), 'width')).toBe('');
    expect(styleOf(element('array'), 'height')).toBe('1px');
    expect(styleOf(element('array'), 'top')).toBe('2px');
  });

  it('applies the joined declarations when the handler does not call resolve()', async () => {
    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({style: () => 'color: green'})],
    });

    @Component({
      template: `<div style="color: red" [style.width.px]="1" (attr.style)="($event)"></div>`,
    })
    class App {}

    const fixture = await render(App);

    const div = fixture.nativeElement.querySelector('div');
    expect(styleOf(div, 'color')).toBe('red');
    expect(styleOf(div, 'width')).toBe('1px');
  });

  it('passes the result of a lower-priority resolver to a higher-priority one', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {style: 'color: red', '(attr.style)': 'resolve($event)'},
    })
    class UiBox {
      resolve(event: StyleResolveEvent) {
        event.resolve(event.resolver('width: 1px'));
      }
    }

    @Component({
      imports: [UiBox],
      template: `<ui-box style="height: 2px" (attr.style)="capture($event)" />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      ['color: red', 'width: 1px'],
      [],
      ['height: 2px'],
    ]);
  });

  it('folds a lower-priority result into the sources under the names they use', async () => {
    @Component({
      selector: 'ui-box',
      template: '',
      host: {
        '[style]': "{fontSize: '1px'}",
        '[style.color]': "'red ! important'",
        '(attr.style)': 'resolve($event)',
      },
    })
    class UiBox {
      resolve(event: StyleResolveEvent) {
        event.resolve(event.resolver({marginTop: '2px'}));
      }
    }

    @Component({
      imports: [UiBox],
      template: `<ui-box style="height: 2px" (attr.style)="capture($event)" />`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      ['font-size: 1px', 'color: red !important', 'margin-top: 2px'],
      [],
      ['height: 2px'],
    ]);
  });

  it('reports a second call to resolve() in dev mode', async () => {
    @Component({
      template: `<div
        (attr.style)="$event.resolve('color: red'); $event.resolve('color: blue')"
      ></div>`,
    })
    class App {}

    await expectAsync(render(App)).toBeRejectedWithError(/NG0320: .*`\(attr\.style\)`/);
  });

  @Component({template: `<div (attr.style)="$event.resolve(reentrant($event))"></div>`})
  class ReentrantApp {
    protected reentrant(event: StyleResolveEvent) {
      return {
        get color() {
          event.resolve('padding: 4px');
          return 'red';
        },
      };
    }
  }

  it('reports a call to resolve() from a value that resolve() reads in dev mode', async () => {
    await expectAsync(render(ReentrantApp)).toBeRejectedWithError(/NG0320/);
  });

  @Component({template: `<div (attr.style)="$event.resolve(reentrant($event))"></div>`})
  class ProxyReentrantApp {
    protected reentrant(event: StyleResolveEvent) {
      return reenteringProxy({color: 'red'}, () => event.resolve('padding: 4px'));
    }
  }

  it('reports a call to resolve() from a check of the value that resolve() makes in dev mode', async () => {
    await expectAsync(render(ProxyReentrantApp)).toBeRejectedWithError(
      /NG0320: The `\(attr\.style\)` handler called `resolve\(\)` more than once/,
    );
  });

  describe('with a result of another resolve event', () => {
    @Component({
      template: `<div
          style="color: red"
          role="menu"
          (attr.role)="keep($event)"
          (attr.style)="$event.resolve(kept)"
        ></div>
        <p style="color: red" (attr.style)="$event.resolve(null)"></p>`,
    })
    class RoleResultApp {
      kept: ResolvedAttribute | null = null;

      protected keep(event: {resolver(): ResolvedAttribute; resolve(value: unknown): void}) {
        this.kept = event.resolver();
        event.resolve(this.kept);
      }
    }

    it("reports the result of another attribute's event in dev mode", async () => {
      await expectAsync(render(RoleResultApp)).toBeRejectedWithError(
        /NG0320: The `\(attr\.style\)` handler .*belongs to another resolve event/,
      );
    });

    it('reports a result passed to the resolver in dev mode', async () => {
      @Component({
        template: `<div
          (attr.style)="$event.resolve($event.resolver($event.resolver('color: red')))"
        ></div>`,
      })
      class App {}

      await expectAsync(render(App)).toBeRejectedWithError(
        /NG0320: The `\(attr\.style\)` handler passed a result to `resolver\(\)`/,
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

      it("reads the result of another attribute's event as null", async () => {
        const fixture = await render(RoleResultApp);
        const div = fixture.nativeElement.querySelector('div');
        const p = fixture.nativeElement.querySelector('p');

        expect(div.getAttribute('style')).toBe(p.getAttribute('style'));
      });
    });
  });

  for (const template of [
    `<div (attr.style)="$event.resolve(fn)"></div>`,
    `<div (attr.style)="$event.resolve(callablePalette)"></div>`,
    `<div (attr.style)="$event.resolve($event.resolver(callablePalette))"></div>`,
    `<div (style)="(s) => s(callablePalette)"></div>`,
  ]) {
    it(`reports a function in ${template} in dev mode`, async () => {
      @Component({template})
      class App {
        readonly fn = () => 'color: red';
        readonly callablePalette = Object.assign(() => {}, {color: 'red'});
      }

      await expectAsync(render(App)).toBeRejectedWithError(/NG0320: .* passed a function to/);
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

    it('applies the call to resolve() from a value that resolve() reads', async () => {
      const fixture = await render(ReentrantApp);
      const div = fixture.nativeElement.querySelector('div');

      expect(styleOf(div, 'padding')).toBe('4px');
      expect(styleOf(div, 'color')).toBe('');
    });

    it('applies the call to resolve() from a check of the value that resolve() makes', async () => {
      const fixture = await render(ProxyReentrantApp);
      const div = fixture.nativeElement.querySelector('div');

      expect(styleOf(div, 'padding')).toBe('4px');
      expect(styleOf(div, 'color')).toBe('');
    });
  });
});

describe('joinDeclarations', () => {
  it('joins the declarations with semicolons, keeping repeated properties', () => {
    expect(joinDeclarations('color: red', 'padding: 4px', 'color: blue')).toBe(
      'color: red; padding: 4px; color: blue',
    );
  });
});

describe('(style) binding', () => {
  it('resolves the callback with the resolver of its event', async () => {
    @Component({
      template: `<div style="color: red" (style)="(s) => s({width: size()})"></div>`,
    })
    class App {
      readonly size = signal('1px');
    }

    const fixture = await render(App);

    const div = fixture.nativeElement.querySelector('div');
    expect(styleOf(div, 'color')).toBe('red');
    expect(styleOf(div, 'width')).toBe('1px');

    fixture.componentInstance.size.set('2px');
    await fixture.whenStable();

    expect(styleOf(div, 'width')).toBe('2px');
  });

  it('resolves in host bindings', async () => {
    @Directive({selector: '[sized]', host: {style: 'width: 1px', '(style)': 'resolve'}})
    class Sized {
      protected readonly resolve = (s: BoundStyleResolver) => s('height: 2px');
    }

    @Component({imports: [Sized], template: `<div sized></div>`})
    class App {}

    const fixture = await render(App);

    const div = fixture.nativeElement.querySelector('div');
    expect(styleOf(div, 'width')).toBe('1px');
    expect(styleOf(div, 'height')).toBe('2px');
  });

  it('reports a result that its own resolver did not create in dev mode', async () => {
    @Component({template: `<div (style)="(asString)"></div>`})
    class App {
      protected readonly asString = () => 'color: red' as unknown as ResolvedAttribute;
    }

    await expectAsync(render(App)).toBeRejectedWithError(/NG0320: .*`\(style\)`/);
  });

  it("rejects @HostListener('style')", () => {
    @Directive({selector: '[dir]'})
    class Dir {
      @HostListener('style', ['$event'])
      onStyle(event: unknown) {}
    }

    @Component({imports: [Dir], template: `<div dir></div>`})
    class App {}

    expect(() => TestBed.createComponent(App)).toThrowError(
      /@HostListener\('style'\) can't declare a style resolver\./,
    );
  });
});

describe('[attr.class] on an element that resolves its classes', () => {
  it('ranks after [class.x] in the template', async () => {
    @Component({
      template: `<div
        [attr.class]="names()"
        [class.a]="false"
        (attr.class)="capture($event)"
      ></div>`,
    })
    class App {
      readonly names = signal<string | null>('a b');
      sources: ClassSources | null = null;

      capture(event: ClassResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');

    expect(fixture.componentInstance.sources).toEqual([[], [], ['a', 'b']]);
    expect(Array.from(div.classList).sort()).toEqual(['a', 'b']);

    fixture.debugElement.injector.get(Renderer2).addClass(div, 'outside');
    fixture.componentInstance.names.set('c');
    await fixture.whenStable();

    expect(fixture.componentInstance.sources).toEqual([[], [], ['c']]);
    expect(Array.from(div.classList).sort()).toEqual(['c', 'outside']);
  });

  it('splits its value on ASCII whitespace only', async () => {
    @Component({
      template: `<div [attr.class]="names" (attr.class)="capture($event)"></div>`,
    })
    class App {
      readonly names = 'a\u00a0b c';
      sources: ClassSources | null = null;

      capture(event: ClassResolveEvent) {
        this.sources = event.sources;
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([[], [], ['a\u00a0b', 'c']]);
  });

  it('ranks after [class.x] in host bindings', async () => {
    @Directive({selector: '[tagged]', host: {'[attr.class]': "'a b'", '[class.a]': 'false'}})
    class Tagged {}

    @Component({
      imports: [Tagged],
      template: `<div tagged (attr.class)="capture($event)"></div>`,
    })
    class App {
      sources: ClassSources | null = null;

      capture(event: ClassResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([[], ['a', 'b'], []]);
    expect(Array.from(fixture.nativeElement.querySelector('div').classList).sort()).toEqual([
      'a',
      'b',
    ]);
  });
});

describe('[attr.style] on an element that resolves its styles', () => {
  it('ranks after [style.x] in host bindings', async () => {
    @Directive({
      selector: '[sized]',
      host: {'[attr.style]': "'width: 1px'", '[style.width.px]': '2'},
    })
    class Sized {}

    @Component({
      imports: [Sized],
      template: `<div sized (attr.style)="capture($event)"></div>`,
    })
    class App {
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([[], ['width: 1px'], []]);
    expect(styleOf(fixture.nativeElement.querySelector('div'), 'width')).toBe('1px');
  });

  it('keeps styles set outside of style bindings', async () => {
    @Component({
      template: `<div
        [attr.style]="value()"
        (attr.style)="$event.resolve($event.resolver())"
      ></div>`,
    })
    class App {
      readonly value = signal('width: 1px');
    }

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    fixture.debugElement.injector.get(Renderer2).setStyle(div, 'height', '2px');

    fixture.componentInstance.value.set('width: 3px');
    await fixture.whenStable();

    expect(styleOf(div, 'width')).toBe('3px');
    expect(styleOf(div, 'height')).toBe('2px');
  });
});

describe('translated [attr.class] and [attr.style] on an element that resolves them', () => {
  afterEach(() => {
    clearTranslations();
  });

  it("takes a translated class interpolation as the template's source", async () => {
    @Component({
      template: `<div
        class="base"
        attr.class="tone-{{ tone() }}"
        i18n-attr.class
        (attr.class)="capture($event)"
      ></div>`,
    })
    class App {
      readonly tone = signal('a');
      sources: ClassSources | null = null;

      capture(event: ClassResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(fixture.componentInstance.sources).toEqual([[], [], ['base', 'tone-a']]);
    expect(Array.from(div.classList).sort()).toEqual(['base', 'tone-a']);

    fixture.componentInstance.tone.set('b');
    await fixture.whenStable();

    expect(fixture.componentInstance.sources).toEqual([[], [], ['base', 'tone-b']]);
    expect(Array.from(div.classList).sort()).toEqual(['base', 'tone-b']);
  });

  it("doesn't write a resolved translated class interpolation directly", async () => {
    @Component({
      template: `<div
        attr.class="tone-{{ tone() }}"
        i18n-attr.class
        (attr.class)="$event.resolve('fixed')"
      ></div>`,
    })
    class App {
      readonly renderer = inject(Renderer2);
      readonly tone = signal('a');
    }

    const fixture = TestBed.createComponent(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    const writes = spyOnWrites(fixture.componentInstance.renderer, div);
    await fixture.whenStable();
    expect(writes()).toEqual(['addClass(fixed)']);

    fixture.componentInstance.tone.set('b');
    await fixture.whenStable();

    expect(writes()).toEqual([]);
    expect(Array.from(div.classList)).toEqual(['fixed']);
  });

  it("takes a translated style interpolation as the template's source", async () => {
    @Component({
      template: `<div
        style="width: 1px"
        attr.style="color: {{ color() }}"
        i18n-attr.style
        (attr.style)="capture($event)"
      ></div>`,
    })
    class App {
      readonly color = signal('red');
      sources: StyleResolveEvent['sources'] | null = null;

      capture(event: StyleResolveEvent) {
        this.sources = event.sources;
        event.resolve('color: blue');
      }
    }

    const fixture = await render(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(fixture.componentInstance.sources).toEqual([[], [], ['width: 1px', 'color: red']]);
    expect(styleOf(div, 'color')).toBe('blue');

    fixture.componentInstance.color.set('green');
    await fixture.whenStable();

    expect(fixture.componentInstance.sources).toEqual([[], [], ['width: 1px', 'color: green']]);
    expect(styleOf(div, 'color')).toBe('blue');
  });

  it("doesn't write a translated style interpolation that resolves to null", async () => {
    @Component({
      template: `<div
        attr.style="color: {{ color() }}"
        i18n-attr.style
        (attr.style)="$event.resolve(null)"
      ></div>`,
    })
    class App {
      readonly renderer = inject(Renderer2);
      readonly color = signal('red');
    }

    const fixture = TestBed.createComponent(App);
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    const writes = spyOnWrites(fixture.componentInstance.renderer, div);
    await fixture.whenStable();
    expect(writes()).toEqual([]);

    fixture.componentInstance.color.set('green');
    await fixture.whenStable();

    expect(writes()).toEqual([]);
    expect(styleOf(div, 'color')).toBe('');
  });
});
