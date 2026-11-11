/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AttributeResolveEvent,
  BoundClassResolver,
  ChangeDetectionStrategy,
  ClassBindingValue,
  ClassCallback,
  ClassResolveEvent,
  ClassResolver,
  ClassSources,
  Component,
  Directive,
  ElementRef,
  EnvironmentProviders,
  ErrorHandler,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  joinTokens,
  Output,
  provideCheckNoChangesConfig,
  provideAttributeResolvers,
  Provider,
  Renderer2,
  ResolvedAttribute,
  signal,
  Type,
  ViewChild,
  ɵɵFactoryTarget,
  ɵɵngDeclareDirective,
  ɵɵngDeclareFactory,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

/**
 * Stand-in for `cn` (`clsx` and `tailwind-merge`). It flattens nested arrays and lets a later class
 * replace an earlier one with the same prefix, so `px-4` after `px-2` wins.
 */
function cn(...inputs: unknown[]): string {
  const byPrefix = new Map<string, string>();
  const add = (input: unknown): void => {
    if (Array.isArray(input)) {
      input.forEach(add);
    } else if (typeof input === 'string') {
      for (const className of input.split(/\s+/).filter(Boolean)) {
        const prefix = className.split('-')[0];
        byPrefix.delete(prefix);
        byPrefix.set(prefix, className);
      }
    }
  };
  inputs.forEach(add);
  return [...byPrefix.values()].join(' ');
}

function markingResolver(name: string): ClassResolver {
  return (...classes) => [...classes, `by-${name}`].join(' ');
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

function classesOf(element: Element): string[] {
  return Array.from(element.classList).sort();
}

describe('(class) binding', () => {
  describe('in a template', () => {
    @Component({selector: 'ui-button', template: '', host: {class: 'bg-primary px-4'}})
    class UiButton {}

    @Component({
      imports: [UiButton],
      template: `<ui-button class="bg-red-600" (class)="(cn) => cn('shadow-lg')" />`,
    })
    class App {}

    it('merges the sources and the extras without a registered resolver', async () => {
      const fixture = await render(App);

      expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual([
        'bg-primary',
        'bg-red-600',
        'px-4',
        'shadow-lg',
      ]);
    });

    it('merges the sources and the extras with the registered resolver', async () => {
      TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});

      const fixture = await render(App);

      expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual([
        'bg-red-600',
        'px-4',
        'shadow-lg',
      ]);
    });

    for (const tag of ['ng-container', 'ng-template']) {
      it(`reports a resolver on <${tag}> in dev mode and runs nothing`, async () => {
        const error = spyOn(console, 'error');

        @Component({
          template: `<${tag} (class)="(record)" /><${tag} (attr.class)="received.push($event)" />`,
        })
        class App {
          readonly received: unknown[] = [];
          protected readonly record = (cn: BoundClassResolver) => {
            this.received.push(cn);
            return cn();
          };
        }

        const fixture = await render(App);

        expect(fixture.componentInstance.received).toEqual([]);
        expect(error.calls.allArgs()).toEqual([
          [jasmine.stringMatching(/^NG0321: The `\(class\)` binding /)],
          [jasmine.stringMatching(/^NG0321: The `\(attr\.class\)` binding /)],
        ]);
      });
    }
  });

  describe("in a component's host bindings", () => {
    const variant = signal<'default' | 'muted'>('default');

    @Component({
      selector: 'ui-button',
      template: '',
      host: {class: 'inline-flex px-4 bg-primary', '(class)': 'classes'},
    })
    class UiButton {
      protected readonly classes = (cn: BoundClassResolver) =>
        cn(variant() === 'muted' && 'bg-muted');
    }

    @Component({imports: [UiButton], template: `<ui-button />`})
    class App {}

    beforeEach(() => variant.set('default'));

    it('merges the sources and the extras without a registered resolver', async () => {
      const fixture = await render(App);
      const button = fixture.nativeElement.querySelector('ui-button');
      expect(classesOf(button)).toEqual(['bg-primary', 'inline-flex', 'px-4']);

      variant.set('muted');
      await fixture.whenStable();

      expect(classesOf(button)).toEqual(['bg-muted', 'bg-primary', 'inline-flex', 'px-4']);
    });

    it('merges the sources and the extras with the registered resolver', async () => {
      TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});

      const fixture = await render(App);
      const button = fixture.nativeElement.querySelector('ui-button');
      expect(classesOf(button)).toEqual(['bg-primary', 'inline-flex', 'px-4']);

      variant.set('muted');
      await fixture.whenStable();

      expect(classesOf(button)).toEqual(['bg-muted', 'inline-flex', 'px-4']);
    });
  });

  it('passes the classes of each source in priority order', async () => {
    @Directive({host: {class: 'ring'}})
    class Ring {}

    @Component({
      selector: 'ui-button',
      template: '',
      hostDirectives: [Ring],
      host: {class: 'cmp-static', '[class]': 'variant()'},
    })
    class UiButton {
      readonly variant = signal('cmp-map');
    }

    @Directive({selector: '[highlight]', host: {class: 'dir-static', '[class.dir-prop]': 'true'}})
    class Highlight {}

    @Component({
      imports: [UiButton, Highlight],
      template: `
        <ui-button
          highlight
          class="tpl-static"
          [class]="'tpl-map'"
          [class.tpl-prop]="true"
          (attr.class)="capture($event)"
        />
      `,
    })
    class App {
      sources: ClassSources | null = null;

      capture(event: ClassResolveEvent) {
        this.sources = event.sources;
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      ['ring', 'cmp-static', 'cmp-map'],
      ['dir-static', 'dir-prop'],
      ['tpl-static', 'tpl-map', 'tpl-prop'],
    ]);
  });

  it('applies only the resolved classes', async () => {
    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});

    @Component({
      selector: 'ui-button',
      template: '',
      host: {class: 'px-2 py-1', '[class.rounded-sm]': 'true'},
    })
    class UiButton {}

    @Component({
      imports: [UiButton],
      template: `<ui-button class="px-4 rounded-lg" (class)="(cn) => cn()" />`,
    })
    class App {}

    const fixture = await render(App);

    const button = fixture.nativeElement.querySelector('ui-button');
    expect(classesOf(button)).toEqual(['px-4', 'py-1', 'rounded-lg']);
  });

  it('reports a class under the highest-priority binding that turns it on', async () => {
    @Component({selector: 'ui-button', template: '', host: {class: 'px-2'}})
    class UiButton {}

    @Component({
      imports: [UiButton],
      template: `<ui-button class="px-4" [class.px-2]="true" (attr.class)="capture($event)" />`,
    })
    class App {
      sources: ClassSources | null = null;

      capture(event: ClassResolveEvent) {
        this.sources = event.sources;
        event.resolve(cn(event.sources));
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([[], [], ['px-4', 'px-2']]);
    expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual(['px-2']);
  });

  it('resolves again when a template or host binding changes', async () => {
    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});
    const tall = signal(false);
    const wide = signal(false);

    @Component({
      selector: 'ui-button',
      template: '',
      host: {class: 'px-2', '[class.py-2]': 'tall()'},
    })
    class UiButton {
      protected readonly tall = tall;
    }

    @Component({
      imports: [UiButton],
      template: `<ui-button [class.px-8]="wide()" (class)="(cn) => cn()" />`,
    })
    class App {
      protected readonly wide = wide;
    }

    const fixture = await render(App);
    const button = fixture.nativeElement.querySelector('ui-button');
    expect(classesOf(button)).toEqual(['px-2']);

    tall.set(true);
    wide.set(true);
    await fixture.whenStable();
    expect(classesOf(button)).toEqual(['px-8', 'py-2']);

    wide.set(false);
    await fixture.whenStable();
    expect(classesOf(button)).toEqual(['px-2', 'py-2']);
  });

  it('leaves out a class that a higher-priority binding turns off', async () => {
    @Component({selector: 'ui-card', template: '', host: {class: 'rounded shadow'}})
    class UiCard {}

    @Component({
      imports: [UiCard],
      template: `<ui-card [class.rounded]="false" (attr.class)="capture($event)" />`,
    })
    class App {
      sources: ClassSources | null = null;

      capture(event: ClassResolveEvent) {
        this.sources = event.sources;
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([['shadow'], [], []]);
    expect(classesOf(fixture.nativeElement.querySelector('ui-card'))).toEqual(['shadow']);
  });

  it('leaves out a class only while a higher-priority binding turns it off', async () => {
    @Directive({selector: '[rounded]', host: {class: 'rounded'}})
    class Rounded {}

    @Component({
      imports: [Rounded],
      template: `<div rounded [class]="opinion()" (class)="(cn) => cn()"></div>`,
    })
    class App {
      readonly opinion = signal<{rounded: boolean | undefined}>({rounded: undefined});
    }

    const fixture = await render(App);
    const div = fixture.nativeElement.querySelector('div');
    expect(classesOf(div)).toEqual(['rounded']);

    fixture.componentInstance.opinion.set({rounded: false});
    await fixture.whenStable();
    expect(classesOf(div)).toEqual([]);

    fixture.componentInstance.opinion.set({rounded: undefined});
    await fixture.whenStable();
    expect(classesOf(div)).toEqual(['rounded']);
  });

  it('leaves out a [class] binding that an input named "class" consumes', async () => {
    @Component({selector: 'ui-button', template: '', host: {class: 'px-2'}})
    class UiButton {
      // A decorator, because these JIT tests don't run the transform for signal-based inputs.
      @Input('class') userClass = '';
    }

    @Component({
      imports: [UiButton],
      template: `<ui-button class="py-1" [class]="'px-4'" (attr.class)="capture($event)" />`,
    })
    class App {
      sources: ClassSources | null = null;

      capture(event: ClassResolveEvent) {
        this.sources = event.sources;
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([['px-2'], [], ['py-1']]);
  });

  for (const [form, callback] of [
    ['an arrow function', `(cn) => cn('m-1')`],
    ['a reference to a field', `withMargin`],
    ['an expression that returns a callback', `margin('m-1')`],
  ]) {
    it(`accepts ${form}`, async () => {
      TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});
      // A variable, so that formatters don't rewrite the interpolated template.
      const template = `<div class="p-2 m-4" (class)="${callback}"></div>`;

      @Component({template})
      class App {
        protected readonly withMargin = (cn: BoundClassResolver) => cn('m-1');

        protected margin(size: string): ClassCallback {
          return (cn) => cn(size);
        }
      }

      const fixture = await render(App);

      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['m-1', 'p-2']);
    });
  }

  it('calls a method that the shorthand reads on its component, as the expansion does', async () => {
    @Component({
      template: `<div (class)="(classes)"></div>
        <span (attr.class)="$event.resolve(classes($event.resolver))"></span>`,
    })
    class App {
      readonly extra = signal('a');

      protected classes(cn: BoundClassResolver) {
        return cn(this.extra());
      }
    }

    const fixture = await render(App);
    const elements = () => Array.from<Element>(fixture.nativeElement.children);
    expect(elements().map(classesOf)).toEqual([['a'], ['a']]);

    fixture.componentInstance.extra.set('b');
    await fixture.whenStable();
    expect(elements().map(classesOf)).toEqual([['b'], ['b']]);
  });

  it('lets an arrow function name its parameter $event, as the expansion does', async () => {
    @Component({
      template: `<div (class)="($event) => $event('a')"></div>
        <span (attr.class)="$event.resolve((($event) => $event('a'))($event.resolver))"></span>`,
    })
    class App {}

    const fixture = await render(App);

    expect(Array.from<Element>(fixture.nativeElement.children).map(classesOf)).toEqual([
      ['a'],
      ['a'],
    ]);
  });

  it('resolves again when state read by the callback changes', async () => {
    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});

    @Component({template: `<div class="p-2" (class)="(cn) => cn(size())"></div>`})
    class App {
      readonly size = signal('text-sm');
    }

    const fixture = await render(App);
    const div = fixture.nativeElement.querySelector('div');
    expect(classesOf(div)).toEqual(['p-2', 'text-sm']);

    fixture.componentInstance.size.set('text-lg');
    await fixture.whenStable();
    expect(classesOf(div)).toEqual(['p-2', 'text-lg']);
  });

  it('keeps classes that were added outside of class bindings', async () => {
    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});

    @Directive({selector: '[focusRing]'})
    class FocusRing {
      constructor() {
        inject(Renderer2).addClass(inject(ElementRef).nativeElement, 'focus-ring');
      }
    }

    @Component({
      imports: [FocusRing],
      template: `<div focusRing class="p-2" [class.p-4]="large()" (class)="(cn) => cn()"></div>`,
    })
    class App {
      readonly large = signal(false);
    }

    const fixture = await render(App);
    const div = fixture.nativeElement.querySelector('div');
    expect(classesOf(div)).toEqual(['focus-ring', 'p-2']);

    fixture.componentInstance.large.set(true);
    await fixture.whenStable();
    expect(classesOf(div)).toEqual(['focus-ring', 'p-4']);
  });

  it('resolves elements in embedded views with their own context', async () => {
    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});

    @Component({
      template: `
        @for (size of sizes(); track $index) {
          <span class="p-1 text-xs" (class)="(cn) => cn(size)"></span>
        }
      `,
    })
    class App {
      readonly sizes = signal(['text-sm', 'text-lg']);
    }

    const fixture = await render(App);
    const spans = () => Array.from<Element>(fixture.nativeElement.querySelectorAll('span'));
    expect(spans().map(classesOf)).toEqual([
      ['p-1', 'text-sm'],
      ['p-1', 'text-lg'],
    ]);

    fixture.componentInstance.sizes.set(['text-base', 'text-lg']);
    await fixture.whenStable();
    expect(spans().map(classesOf)).toEqual([
      ['p-1', 'text-base'],
      ['p-1', 'text-lg'],
    ]);
  });

  it('resolves embedded views that move, go away, and come back with their own context', async () => {
    @Component({
      template: `
        @for (item of items(); track item.id) {
          <span (class)="(cn) => cn(item.name)"></span>
        }
      `,
    })
    class App {
      readonly items = signal([
        {id: 1, name: 'one'},
        {id: 2, name: 'two'},
      ]);
    }

    const fixture = await render(App);
    const spans = () => Array.from<Element>(fixture.nativeElement.querySelectorAll('span'));
    const [first, second] = spans();
    expect(spans().map(classesOf)).toEqual([['one'], ['two']]);

    fixture.componentInstance.items.set([
      {id: 2, name: 'changed'},
      {id: 1, name: 'one'},
    ]);
    await fixture.whenStable();
    expect(spans()[0]).toBe(second);
    expect(spans()[1]).toBe(first);
    expect(spans().map(classesOf)).toEqual([['changed'], ['one']]);

    fixture.componentInstance.items.set([]);
    await fixture.whenStable();
    expect(spans()).toEqual([]);

    fixture.componentInstance.items.set([{id: 1, name: 'new'}]);
    await fixture.whenStable();
    expect(spans()[0]).not.toBe(first);
    expect(spans().map(classesOf)).toEqual([['new']]);
  });

  it('calls the callback once with the resolver of its event', async () => {
    const runs: Array<{event: ClassResolveEvent; calls: unknown[]}> = [];

    @Component({template: `<div class="c" (class)="resolveWith($event)"></div>`})
    class App {
      protected resolveWith(event: ClassResolveEvent): ClassCallback {
        const run = {event, calls: [] as unknown[]};
        runs.push(run);
        return (cn) => {
          run.calls.push(cn);
          return cn('a');
        };
      }
    }

    const fixture = await render(App);

    expect(runs.length).toBeGreaterThan(0);
    for (const run of runs) {
      expect(run.calls).toEqual([run.event.resolver]);
    }
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['a', 'c']);
  });

  it('listens to a global event named class with a target', async () => {
    @Directive({selector: '[dir]', host: {'(document:class)': 'count = count + 1'}})
    class Dir {
      count = 0;
    }

    @Component({
      imports: [Dir],
      template: `<div dir class="c" (document:class)="count = count + 1"></div>`,
    })
    class App {
      count = 0;
      @ViewChild(Dir, {static: true}) dir!: Dir;
    }

    const fixture = await render(App);
    fixture.nativeElement.ownerDocument.dispatchEvent(new Event('class'));
    await fixture.whenStable();

    expect(fixture.componentInstance.count).toBe(1);
    expect(fixture.componentInstance.dir.count).toBe(1);
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['c']);
  });

  it('listens to a global event named class with a target through @HostListener', async () => {
    @Directive({selector: '[dir]'})
    class Dir {
      count = 0;

      @HostListener('document:class')
      onClass() {
        this.count++;
      }
    }

    @Component({imports: [Dir], template: `<div dir class="c"></div>`})
    class App {
      @ViewChild(Dir, {static: true}) dir!: Dir;
    }

    const fixture = await render(App);
    fixture.nativeElement.ownerDocument.dispatchEvent(new Event('class'));
    await fixture.whenStable();

    expect(fixture.componentInstance.dir.count).toBe(1);
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['c']);
  });

  describe('when the callback returns classes that its own resolver did not create', () => {
    it('reports a value of another type in dev mode', async () => {
      @Component({template: `<div (class)="(asString)"></div>`})
      class App {
        protected readonly asString = () => 'a' as unknown as ResolvedAttribute;
      }

      await expectAsync(render(App)).toBeRejectedWithError(/NG0320: .*`\(class\)`/);
    });

    it("reports classes from another element's resolver in dev mode", async () => {
      @Component({
        template: `<div (class)="(keep)"></div>
          <span (class)="(reuse)"></span>`,
      })
      class App {
        private kept: ResolvedAttribute | null = null;
        protected readonly keep = (cn: BoundClassResolver) => (this.kept = cn('a'));
        protected readonly reuse = (cn: BoundClassResolver) => this.kept!;
      }

      await expectAsync(render(App)).toBeRejectedWithError(/NG0320: .*`\(class\)`/);
    });

    it('reports classes from an earlier refresh in dev mode', async () => {
      const errors: unknown[] = [];
      TestBed.configureTestingModule({
        rethrowApplicationErrors: false,
        providers: [
          {provide: ErrorHandler, useValue: {handleError: (e: unknown) => errors.push(e)}},
        ],
      });

      @Component({template: `<div (class)="(keep)"></div>`})
      class App {
        readonly reuse = signal(false);
        private kept: ResolvedAttribute | null = null;
        protected readonly keep = (cn: BoundClassResolver) =>
          this.reuse() ? this.kept! : (this.kept = cn('a'));
      }

      const fixture = await render(App);
      expect(errors).toEqual([]);

      fixture.componentInstance.reuse.set(true);
      await fixture.whenStable();

      expect(errors.map(String).join('\n')).toMatch(/NG0320: .*`\(class\)`/);
    });
  });

  describe('in host bindings', () => {
    @Component({
      selector: 'ui-button',
      template: '',
      host: {class: 'px-2 py-1', '(class)': 'merge'},
    })
    class UiButton {
      protected readonly merge = (cn: BoundClassResolver) => cn();
    }

    it("passes the component's resolved classes to the template's binding", async () => {
      TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: cn})]});

      @Component({
        imports: [UiButton],
        template: `<ui-button class="px-4" (attr.class)="capture($event)" />`,
      })
      class App {
        sources: ClassSources | null = null;

        protected capture(event: ClassResolveEvent) {
          this.sources = event.sources;
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.sources).toEqual([['py-1'], [], ['px-4']]);
      expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual(['px-4', 'py-1']);
    });

    it('runs the expressions before the last one of a chain in a linked declaration as statements', async () => {
      class Counted {
        count = 0;
        protected readonly resolve = (cn: BoundClassResolver) => cn('counted');

        static ɵfac = ɵɵngDeclareFactory({
          type: Counted,
          deps: [],
          target: ɵɵFactoryTarget.Directive,
        });
        static ɵdir = ɵɵngDeclareDirective({
          version: '22.3.0',
          type: Counted,
          isStandalone: true,
          selector: '[counted]',
          host: {listeners: {'class': 'count = count + 1; resolve'}},
        });
      }

      @Component({imports: [Counted], template: `<div counted class="c"></div>`})
      class App {
        @ViewChild(Counted, {static: true}) counted!: Counted;
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.counted.count).toBeGreaterThan(0);
      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['c', 'counted']);
    });
  });

  describe('next to a directive output named "class"', () => {
    // Decorators, because these JIT tests don't run the transform for signal-based outputs and queries.
    @Directive({selector: '[emitter]'})
    class Emitter {
      @Output('class') readonly classEvent = new EventEmitter<string>();
    }

    it('resolves the classes of an element and ignores the output', async () => {
      const warn = spyOn(console, 'warn');

      @Component({
        imports: [Emitter],
        template: `<div emitter class="p-2" [class.p-4]="true" (class)="record($event)"></div>`,
      })
      class App {
        readonly received: unknown[] = [];
        @ViewChild(Emitter) emitter!: Emitter;

        protected record(event: unknown): ClassCallback {
          this.received.push(event);
          return (cn) => cn('resolved');
        }
      }

      const fixture = await render(App);
      fixture.componentInstance.emitter.classEvent.emit('sent');
      await fixture.whenStable();

      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual([
        'p-2',
        'p-4',
        'resolved',
      ]);
      expect(fixture.componentInstance.received.length).toBeGreaterThan(0);
      expect(fixture.componentInstance.received).not.toContain('sent');
      expect(warn).not.toHaveBeenCalled();
    });

    it('resolves the classes of an element and ignores the output of a host directive', async () => {
      const warn = spyOn(console, 'warn');

      @Component({
        selector: 'ui-card',
        template: '',
        hostDirectives: [{directive: Emitter, outputs: ['class']}],
      })
      class UiCard {}

      @Component({
        imports: [UiCard],
        template: `<ui-card class="p-2" (class)="record($event)" />`,
      })
      class App {
        readonly received: unknown[] = [];
        @ViewChild(Emitter) emitter!: Emitter;

        protected record(event: unknown): ClassCallback {
          this.received.push(event);
          return (cn) => cn('resolved');
        }
      }

      const fixture = await render(App);
      fixture.componentInstance.emitter.classEvent.emit('sent');
      await fixture.whenStable();

      expect(classesOf(fixture.nativeElement.querySelector('ui-card'))).toEqual([
        'p-2',
        'resolved',
      ]);
      expect(fixture.componentInstance.received.length).toBeGreaterThan(0);
      expect(fixture.componentInstance.received).not.toContain('sent');
      expect(warn).not.toHaveBeenCalled();
    });

    for (const tag of ['ng-container', 'ng-template']) {
      it(`ignores the output and runs no resolver on <${tag}>`, async () => {
        const error = spyOn(console, 'error');
        const recorded: unknown[] = [];

        @Directive({selector: '[recorder]', host: {'(class)': 'record'}})
        class Recorder {
          protected readonly record = (cn: BoundClassResolver) => {
            recorded.push(cn);
            return cn();
          };
        }

        @Component({
          imports: [Emitter, Recorder],
          template: `<${tag} emitter recorder (class)="received.push($event)" />`,
        })
        class App {
          readonly received: unknown[] = [];
          @ViewChild(Emitter) emitter!: Emitter;
        }

        const fixture = await render(App);
        fixture.componentInstance.emitter.classEvent.emit('sent');
        await fixture.whenStable();

        expect(recorded).toEqual([]);
        expect(fixture.componentInstance.received).toEqual([]);
        expect(error.calls.allArgs()).toEqual([
          [jasmine.stringMatching(/^NG0321: The `\(class\)` host binding of `Recorder` /)],
          [jasmine.stringMatching(/^NG0321: The `\(class\)` binding /)],
        ]);
      });
    }
  });

  describe('with several resolvers on one element', () => {
    // Each resolver records that it ran and adds a class named after itself.
    let runs: string[] = [];
    beforeEach(() => (runs = []));

    function resolver(name: string): ClassCallback {
      return (cn) => {
        runs.push(name);
        return cn(`by-${name}`);
      };
    }

    function ranResolvers(): string[] {
      return [...new Set(runs)];
    }

    function captureErrors(providers: Array<Provider | EnvironmentProviders> = []): unknown[] {
      const errors: unknown[] = [];
      TestBed.configureTestingModule({
        rethrowApplicationErrors: false,
        providers: [
          {provide: ErrorHandler, useValue: {handleError: (e: unknown) => errors.push(e)}},
          ...providers,
        ],
      });
      return errors;
    }

    @Directive({host: {'(class)': 'resolve'}})
    class Supplied {
      protected readonly resolve = resolver('supplied');
    }

    @Component({
      selector: 'ui-button',
      template: '',
      hostDirectives: [Supplied],
      host: {class: 'cmp', '(class)': 'resolve'},
    })
    class UiButton {
      protected readonly resolve = resolver('cmp-host');
    }

    @Directive({selector: '[tooltip]', host: {'(class)': 'resolve'}})
    class Tooltip {
      protected readonly resolve = resolver('tooltip');
    }

    @Directive({selector: '[ring]', host: {'(class)': 'resolve'}})
    class Ring {
      @HostBinding('class') readonly ringClass = 'ring';
      protected readonly resolve = resolver('ring');
    }

    it('runs every resolver from the lowest to the highest priority', async () => {
      @Component({
        imports: [UiButton, Tooltip, Ring],
        template: `<ui-button tooltip ring class="tpl" (attr.class)="capture($event)" />`,
      })
      class App {
        sources: ClassSources | null = null;

        protected capture(event: ClassResolveEvent) {
          runs.push('template');
          this.sources = event.sources;
          event.resolve(event.resolver('by-template'));
        }
      }

      const fixture = await render(App);

      expect(ranResolvers()).toEqual(['supplied', 'cmp-host', 'tooltip', 'ring', 'template']);
      expect(fixture.componentInstance.sources).toEqual([
        ['cmp', 'by-supplied', 'by-cmp-host'],
        ['ring', 'by-tooltip', 'by-ring'],
        ['tpl'],
      ]);
      expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual([
        'by-cmp-host',
        'by-ring',
        'by-supplied',
        'by-template',
        'by-tooltip',
        'cmp',
        'ring',
        'tpl',
      ]);
    });

    it('matches directives in the order of the imports', async () => {
      @Component({imports: [UiButton, Ring, Tooltip], template: `<ui-button tooltip ring />`})
      class App {}

      await render(App);

      expect(ranResolvers()).toEqual(['supplied', 'cmp-host', 'ring', 'tooltip']);
    });

    describe('declared through inheritance', () => {
      @Directive({host: {'(class)': 'resolveBase'}})
      class Base {
        protected readonly resolveBase = resolver('base');
      }

      it('runs the resolver that a directive inherits', async () => {
        @Directive({selector: '[sub]'})
        class Sub extends Base {}

        @Component({imports: [Sub], template: `<div sub></div>`})
        class App {}

        const fixture = await render(App);

        expect(ranResolvers()).toEqual(['base']);
        expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['by-base']);
      });

      it('reports a directive that inherits a resolver and declares another one in dev mode', async () => {
        @Directive({selector: '[sub]', host: {'(class)': 'resolveSub'}})
        class Sub extends Base {
          protected readonly resolveSub = resolver('sub');
        }

        @Component({imports: [Sub], template: `<div sub></div>`})
        class App {}

        await expectAsync(render(App)).toBeRejectedWithError(/^NG0323: `Sub` has more than one /);
        expect(runs).toEqual([]);
      });
    });

    it('passes the next resolver only the classes that a lower resolver resolved', async () => {
      @Directive({selector: '[tidy]', host: {class: 'dir', '(attr.class)': 'tidy($event)'}})
      class Tidy {
        protected tidy(event: ClassResolveEvent) {
          event.resolve([
            ...event.sources.flat().filter((className) => className !== 'drop'),
            'added',
          ]);
        }
      }

      @Component({
        imports: [Tidy],
        template: `<div tidy class="keep drop" (attr.class)="capture($event)"></div>`,
      })
      class App {
        sources: ClassSources | null = null;

        protected capture(event: ClassResolveEvent) {
          this.sources = event.sources;
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.sources).toEqual([[], ['dir', 'added'], ['keep']]);
      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual([
        'added',
        'dir',
        'keep',
      ]);
    });

    it('keeps the order of the classes that a lower resolver resolved', async () => {
      @Directive({selector: '[lower]', host: {class: 'x y', '(attr.class)': 'resolve($event)'}})
      class Lower {
        protected resolve(event: ClassResolveEvent) {
          event.resolve(event.sources.flat().reverse());
        }
      }

      @Component({
        imports: [Lower],
        template: `<div lower class="a b" (attr.class)="capture($event)"></div>`,
      })
      class App {
        sources: ClassSources | null = null;

        protected capture(event: ClassResolveEvent) {
          this.sources = event.sources;
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.sources).toEqual([[], ['y', 'x'], ['b', 'a']]);
    });

    it("ranks a class that a lower resolver appends at its owner's source", async () => {
      @Component({
        selector: 'ui-badge',
        template: '',
        host: {class: 'bg-primary', '(class)': 'resolve'},
      })
      class UiBadge {
        protected readonly resolve = (cn: BoundClassResolver) => cn('bg-muted');
      }

      @Component({
        imports: [UiBadge],
        template: `<ui-badge class="bg-red-600" (attr.class)="capture($event)" />`,
      })
      class App {
        sources: ClassSources | null = null;

        protected capture(event: ClassResolveEvent) {
          this.sources = event.sources;
          event.resolve(cn(event.sources));
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.sources).toEqual([
        ['bg-primary', 'bg-muted'],
        [],
        ['bg-red-600'],
      ]);
      expect(classesOf(fixture.nativeElement.querySelector('ui-badge'))).toEqual(['bg-red-600']);
    });

    for (const [form, value, expected] of [
      ['a string', 'a  b', ['a', 'b']],
      ['a string with a duplicate', 'a b a', ['a', 'b']],
      ['an array', ['a', '', 'b'], ['a', 'b']],
      ['an array with a duplicate', ['a', 'b', 'a'], ['a', 'b']],
      ['a Set', new Set(['a', 'b']), ['a', 'b']],
      ['an object map', {a: true, x: false, b: 1}, ['a', 'b']],
      ['null', null, []],
      ['undefined', undefined, []],
      ['false', false, []],
      ['an empty string', '', []],
      ['a number', 42, []],
    ] as Array<[string, unknown, string[]]>) {
      it(`passes on and applies only the classes of ${form} that a lower resolver resolved`, async () => {
        @Directive({selector: '[lower]', host: {'(attr.class)': '$event.resolve(value)'}})
        class Lower {
          protected readonly value = value;
        }

        @Component({
          imports: [Lower],
          template: `<div lower class="c" (attr.class)="capture($event)"></div>`,
        })
        class App {
          sources: ClassSources | null = null;

          protected capture(event: ClassResolveEvent) {
            this.sources = event.sources;
          }
        }

        const fixture = await render(App);

        expect(fixture.componentInstance.sources!.flat()).toEqual(expected);
        expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(expected);
      });
    }

    it('runs the host and template resolvers next to a directive output named class', async () => {
      const warn = spyOn(console, 'warn');

      @Directive({selector: '[emitter]'})
      class Emitter {
        @Output('class') readonly classEvent = new EventEmitter<string>();
      }

      @Component({
        selector: 'ui-card',
        template: '',
        host: {class: 'cmp', '(class)': 'resolve'},
      })
      class UiCard {
        protected readonly resolve = resolver('cmp-host');
      }

      @Component({
        imports: [UiCard, Emitter],
        template: `<ui-card emitter class="tpl" (class)="record($event)" />`,
      })
      class App {
        readonly received: unknown[] = [];
        @ViewChild(Emitter) emitter!: Emitter;

        protected record(event: unknown): ClassCallback {
          this.received.push(event);
          return resolver('template');
        }
      }

      const fixture = await render(App);
      expect(ranResolvers()).toEqual(['cmp-host', 'template']);
      expect(classesOf(fixture.nativeElement.querySelector('ui-card'))).toEqual([
        'by-cmp-host',
        'by-template',
        'cmp',
        'tpl',
      ]);

      fixture.componentInstance.emitter.classEvent.emit('sent');
      await fixture.whenStable();

      expect(fixture.componentInstance.received).not.toContain('sent');
      expect(warn).not.toHaveBeenCalled();
    });

    it("runs the component's resolver next to a host directive output aliased as class", async () => {
      @Directive()
      class Emitter {
        @Output() readonly changed = new EventEmitter<string>();
      }

      @Component({
        selector: 'ui-card',
        template: '',
        hostDirectives: [{directive: Emitter, outputs: ['changed: class']}],
        host: {class: 'cmp', '(class)': 'resolve'},
      })
      class UiCard {
        protected readonly resolve = resolver('cmp-host');
      }

      @Component({imports: [UiCard], template: `<ui-card />`})
      class App {}

      const fixture = await render(App);

      expect(ranResolvers()).toEqual(['cmp-host']);
      expect(classesOf(fixture.nativeElement.querySelector('ui-card'))).toEqual([
        'by-cmp-host',
        'cmp',
      ]);
    });

    it('reports a resolver that writes a signal', async () => {
      const errors = captureErrors();

      @Component({template: `<div class="p-2" (class)="(record)"></div>`})
      class App {
        readonly resolutions = signal(0);

        protected readonly record = (cn: BoundClassResolver) => {
          this.resolutions.update((count) => count + 1);
          return cn();
        };
      }

      await render(App);

      expect(errors.map(String).join('\n')).toContain('NG0600');
    });

    describe('when a resolver changes state that its own bindings read', () => {
      @Component({
        template: `<div [class.odd]="resolutions % 2 === 1" (class)="(track)"></div>`,
      })
      class App {
        resolutions = 0;

        protected readonly track = (cn: BoundClassResolver) => {
          this.resolutions++;
          return cn();
        };
      }

      it('leaves an OnPush element out of date without an error', async () => {
        const errors = captureErrors();

        const fixture = await render(App);

        // The binding read `resolutions` before the resolver made it odd.
        expect(fixture.componentInstance.resolutions).toBe(1);
        expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual([]);
        expect(errors).toEqual([]);
      });

      it('reports the change when checkNoChanges is exhaustive', async () => {
        const errors = captureErrors([provideCheckNoChangesConfig({exhaustive: true})]);

        await render(App);

        expect(errors.map(String).join('\n')).toContain('NG0100');
      });

      it('reports the change in an eager view', async () => {
        const errors = captureErrors();

        @Component({
          template: `<div [class.odd]="resolutions % 2 === 1" (class)="(track)"></div>`,
          changeDetection: ChangeDetectionStrategy.Eager,
        })
        class EagerApp extends App {}

        await render(EagerApp);

        expect(errors.map(String).join('\n')).toContain('NG0100');
      });
    });
  });
});

describe('provideAttributeResolvers', () => {
  @Component({
    selector: 'ui-panel',
    template: `<div class="inner" (class)="(cn) => cn()"></div>
      <ng-content />`,
    viewProviders: [provideAttributeResolvers({class: markingResolver('view')})],
  })
  class UiPanel {}

  it('passes the resolver one argument per class, in priority order', async () => {
    const resolver = jasmine.createSpy<ClassResolver>('resolver').and.callFake(cn);

    @Component({selector: 'ui-card', template: '', host: {class: 'px-4 py-2'}})
    class UiCard {}

    @Component({imports: [UiCard], template: `<ui-card class="px-2" (class)="(cn) => cn()" />`})
    class App {}

    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: resolver})]});
    const fixture = await render(App);

    expect(resolver.calls.allArgs()).toEqual([['px-4', 'py-2', 'px-2']]);
    expect(classesOf(fixture.nativeElement.querySelector('ui-card'))).toEqual(['px-2', 'py-2']);
  });

  it("passes the resolver the extras as their own arguments at the end of the caller's source", async () => {
    const resolver = jasmine.createSpy<ClassResolver>('resolver').and.callFake(cn);

    @Component({
      selector: 'ui-card',
      template: '',
      host: {class: 'cmp', '(class)': 'resolve'},
    })
    class UiCard {
      protected readonly resolve = (cn: BoundClassResolver) => cn('x y', ['z']);
    }

    @Directive({selector: '[tooltip]', host: {class: 'dir'}})
    class Tooltip {}

    @Component({imports: [UiCard, Tooltip], template: `<ui-card tooltip class="tpl" />`})
    class App {}

    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: resolver})]});
    await render(App);

    expect(resolver.calls.allArgs()).toEqual([['cmp', 'x', 'y', 'z', 'dir', 'tpl']]);
  });

  it('passes the resolver no argument for an empty static class', async () => {
    const resolver = jasmine.createSpy<ClassResolver>('resolver').and.callFake(cn);

    @Component({selector: 'ui-card', template: '', host: {class: ''}})
    class UiCard {}

    @Directive({selector: '[tooltip]', host: {class: 'px-2'}})
    class Tooltip {}

    @Component({
      imports: [UiCard, Tooltip],
      template: `<ui-card tooltip class="" (class)="(cn) => cn()" />`,
    })
    class App {}

    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: resolver})]});
    await render(App);

    expect(resolver.calls.allArgs()).toEqual([['px-2']]);
  });

  it('passes the resolver one argument per class of a binding whose name contains a space', async () => {
    const resolver = jasmine.createSpy<ClassResolver>('resolver').and.callFake(cn);
    const joined = signal(true);

    @Component({
      selector: 'ui-card',
      template: '',
      host: {'[class.a b]': 'joined()', '[class.a]': '!joined()', '[class.b]': '!joined()'},
    })
    class UiCard {
      protected readonly joined = joined;
    }

    @Component({imports: [UiCard], template: `<ui-card (class)="(cn) => cn()" />`})
    class App {}

    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: resolver})]});
    const fixture = await render(App);
    const card = fixture.nativeElement.querySelector('ui-card');

    expect(resolver.calls.mostRecent().args).toEqual(['a', 'b']);
    expect(classesOf(card)).toEqual(['a', 'b']);

    joined.set(false);
    await fixture.whenStable();

    expect(resolver.calls.mostRecent().args).toEqual(['a', 'b']);
    expect(classesOf(card)).toEqual(['a', 'b']);
  });

  it('passes the resolver one argument per class of a Set in a [class] binding', async () => {
    const resolver = jasmine.createSpy<ClassResolver>('resolver').and.callFake(cn);

    @Component({selector: 'ui-card', template: '', host: {class: 'px-4'}})
    class UiCard {}

    @Component({
      imports: [UiCard],
      template: `<ui-card [class]="classes" (class)="(cn) => cn()" />`,
    })
    class App {
      protected readonly classes = new Set(['px-2', 'py-4']);
    }

    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: resolver})]});
    await render(App);

    expect(resolver.calls.allArgs()).toEqual([['px-4', 'px-2', 'py-4']]);
  });

  it("passes the resolver the extras of an (attr.class) binding as their own arguments at the end of the caller's source", async () => {
    const resolver = jasmine.createSpy<ClassResolver>('resolver').and.callFake(cn);

    @Component({selector: 'ui-card', template: '', host: {class: 'cmp'}})
    class UiCard {}

    @Component({
      imports: [UiCard],
      template: `<ui-card
        class="tpl"
        (attr.class)="$event.resolve($event.resolver('x y', ['z']))"
      />`,
    })
    class App {}

    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: resolver})]});
    await render(App);

    expect(resolver.calls.allArgs()).toEqual([['cmp', 'tpl', 'x', 'y', 'z']]);
  });

  it('passes the resolver an extra that repeats a class of the sources as its own argument', async () => {
    const resolver = jasmine.createSpy<ClassResolver>('resolver').and.callFake(cn);

    @Component({selector: 'ui-card', template: '', host: {class: 'shared cmp'}})
    class UiCard {}

    @Component({
      imports: [UiCard],
      template: `<ui-card class="shared tpl" (class)="(cn) => cn('shared')" />`,
    })
    class App {}

    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: resolver})]});
    await render(App);

    expect(resolver.calls.allArgs()).toEqual([['cmp', 'shared', 'tpl', 'shared']]);
  });

  it("resolves a component's template with its view resolver and projected content with the outer one", async () => {
    @Component({
      imports: [UiPanel],
      template: `<ui-panel><span class="projected" (class)="(cn) => cn()"></span></ui-panel>`,
      providers: [provideAttributeResolvers({class: markingResolver('outer')})],
    })
    class App {}

    const fixture = await render(App);

    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['by-view', 'inner']);
    expect(classesOf(fixture.nativeElement.querySelector('span'))).toEqual([
      'by-outer',
      'projected',
    ]);
  });

  it("resolves a component's own host binding with its view resolver and the template's with the outer one", async () => {
    @Component({
      selector: 'ui-badge',
      template: '',
      host: {'(class)': 'resolve'},
      viewProviders: [provideAttributeResolvers({class: markingResolver('view')})],
    })
    class UiBadge {
      protected readonly resolve = (cn: BoundClassResolver) => cn('by-host');
    }

    @Component({
      imports: [UiBadge],
      template: `<ui-badge (attr.class)="capture($event)" />`,
      providers: [provideAttributeResolvers({class: markingResolver('outer')})],
    })
    class App {
      sources: ClassSources | null = null;

      protected capture(event: ClassResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([['by-host', 'by-view'], [], []]);
    expect(classesOf(fixture.nativeElement.querySelector('ui-badge'))).toEqual([
      'by-host',
      'by-outer',
      'by-view',
    ]);
  });

  it('resolves a directive on a component host with the outer resolver', async () => {
    @Component({
      selector: 'ui-badge',
      template: '',
      viewProviders: [provideAttributeResolvers({class: markingResolver('view')})],
    })
    class UiBadge {}

    @Directive({selector: '[elevated]', host: {'(class)': 'resolve'}})
    class Elevated {
      protected readonly resolve = (cn: BoundClassResolver) => cn();
    }

    @Component({
      imports: [UiBadge, Elevated],
      template: `<ui-badge elevated />`,
      providers: [provideAttributeResolvers({class: markingResolver('outer')})],
    })
    class App {}

    const fixture = await render(App);

    expect(classesOf(fixture.nativeElement.querySelector('ui-badge'))).toEqual(['by-outer']);
  });
});

describe('class resolver declarations', () => {
  function containing(text: string): RegExp {
    return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  }

  it('rejects a host (attr.href)', () => {
    @Directive({selector: '[dir]', host: {'(attr.href)': 'capture($event)'}})
    class Dir {
      protected capture(event: unknown) {}
    }

    @Component({imports: [Dir], template: `<div dir></div>`})
    class App {}

    expect(() => TestBed.createComponent(App)).toThrowError(
      containing(
        `Can't resolve the 'href' attribute in a host binding, because its value needs ` +
          `sanitization on some elements.`,
      ),
    );
  });

  describe('in a partial declaration', () => {
    // An older library declared these listeners as ordinary event bindings. The facade's type
    // doesn't declare `minVersion`, so it's spread in.
    const olderLibrary = {minVersion: '14.0.0', version: '22.2.0'};

    function declareDirective(listener: string, versions = {version: '22.3.0'}) {
      class Dir {
        protected capture(event: unknown) {}
        static ɵfac = ɵɵngDeclareFactory({type: Dir, deps: [], target: ɵɵFactoryTarget.Directive});
        static ɵdir = ɵɵngDeclareDirective({
          ...versions,
          type: Dir,
          isStandalone: true,
          selector: '[dir]',
          host: {listeners: {[listener]: 'capture($event)'}},
        });
      }
      return Dir;
    }

    it('accepts (attr.role)', () => {
      expect(() => declareDirective('attr.role')).not.toThrow();
    });

    it('rejects (attr.href) from an older library', () => {
      expect(() => declareDirective('attr.href', olderLibrary)).toThrowError(
        containing(
          `Can't resolve the 'href' attribute in a host binding, because its value needs ` +
            `sanitization on some elements.`,
        ),
      );
    });

    it('rejects a namespaced (attr.xlink:title) from an older library', () => {
      expect(() => declareDirective('attr.xlink:title', olderLibrary)).toThrowError(
        containing(
          `Can't resolve the namespaced attribute 'xlink:title'. Only attributes without a ` +
            `namespace can be resolved.`,
        ),
      );
    });
  });

  for (const tag of ['ng-container', 'ng-template']) {
    it(`rejects a second class resolver on <${tag}>`, () => {
      @Component({
        template: `<${tag} (class)="(cn) => cn()" (attr.class)="received.push($event)"></${tag}>`,
      })
      class App {
        readonly received: unknown[] = [];
      }

      expect(() => TestBed.createComponent(App)).toThrowError(
        containing(
          `Can't have multiple class resolvers on one element. Use only one '(class)' or ` +
            `'(attr.class)' binding.`,
        ),
      );
    });
  }
});

describe('(attr.class) binding', () => {
  @Component({selector: 'ui-button', template: '', host: {class: 'btn px-2'}})
  class UiButton {}

  it('applies the classes that the handler resolves', async () => {
    @Component({
      imports: [UiButton],
      template: `<ui-button
        class="px-4"
        (attr.class)="$event.resolve($event.resolver('shadow-lg'))"
      />`,
    })
    class App {}

    const fixture = await render(App);

    expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual([
      'btn',
      'px-2',
      'px-4',
      'shadow-lg',
    ]);
  });

  it("passes the sources through when the handler doesn't call resolve()", async () => {
    @Component({
      imports: [UiButton],
      template: `<ui-button class="px-4" (attr.class)="track($event.sources)" />`,
    })
    class App {
      sources: ClassSources | null = null;

      protected track(sources: ClassSources) {
        this.sources = sources;
        return ['ignored'];
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([['btn', 'px-2'], [], ['px-4']]);
    expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual([
      'btn',
      'px-2',
      'px-4',
    ]);
  });

  it('replaces every class with the classes passed to resolve()', async () => {
    @Component({
      imports: [UiButton],
      template: `<ui-button class="px-4" (attr.class)="$event.resolve(['only'])" />`,
    })
    class App {}

    const fixture = await render(App);

    expect(classesOf(fixture.nativeElement.querySelector('ui-button'))).toEqual(['only']);
  });

  it('applies the sources again after a refresh in which the handler replaced them', async () => {
    @Directive({selector: '[focusRing]'})
    class FocusRing {
      constructor() {
        inject(Renderer2).addClass(inject(ElementRef).nativeElement, 'focus-ring');
      }
    }

    @Component({
      imports: [FocusRing],
      template: `<div focusRing class="c" [class]="classes()" (attr.class)="apply($event)"></div>`,
    })
    class App {
      readonly replace = signal(true);
      readonly classes = signal('a');

      protected apply(event: ClassResolveEvent) {
        if (this.replace()) {
          event.resolve('only');
        }
      }
    }

    const fixture = await render(App);
    const div = fixture.nativeElement.querySelector('div');
    expect(classesOf(div)).toEqual(['focus-ring', 'only']);

    fixture.componentInstance.classes.set('b');
    fixture.componentInstance.replace.set(false);
    await fixture.whenStable();
    expect(classesOf(div)).toEqual(['b', 'c', 'focus-ring']);

    fixture.componentInstance.replace.set(true);
    await fixture.whenStable();
    expect(classesOf(div)).toEqual(['focus-ring', 'only']);
  });

  it('resolves through resolve() and the resolver called on their own', async () => {
    @Component({template: `<div class="c" (attr.class)="apply($event)"></div>`})
    class App {
      protected apply({resolve, resolver}: ClassResolveEvent) {
        resolve(resolver('d'));
      }
    }

    const fixture = await render(App);

    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['c', 'd']);
  });

  it('merges without empty and repeated names, in order, without a registered resolver', async () => {
    @Component({template: `<div class="a b" (attr.class)="resolveWith($event)"></div>`})
    class App {
      merged = '';

      protected resolveWith(event: ClassResolveEvent) {
        const classes = event.resolver('c a', 'b d');
        this.merged = String(classes);
        event.resolve(classes);
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.merged).toBe('a b c d');
  });

  it('resolves (attr.title) without listening to an attr.title event', async () => {
    @Component({
      template: `<div class="c" title="t" (attr.title)="count = count + 1"></div>`,
    })
    class App {
      count = 0;
    }

    const fixture = await render(App);
    const div = fixture.nativeElement.querySelector('div');
    const count = fixture.componentInstance.count;
    div.dispatchEvent(new Event('attr.title'));
    await fixture.whenStable();

    expect(count).toBeGreaterThan(0);
    expect(fixture.componentInstance.count).toBe(count);
    expect(div.getAttribute('title')).toBe('t');
    expect(classesOf(div)).toEqual(['c']);
  });

  describe("ranks the resolver's extras at the end of the caller's source", () => {
    @Directive({selector: '[tooltip]', host: {class: 'dir'}})
    class Tooltip {}

    it('from the template', async () => {
      @Component({selector: 'ui-card', template: '', host: {class: 'cmp'}})
      class UiCard {}

      @Component({
        imports: [UiCard, Tooltip],
        template: `<ui-card
          tooltip
          class="tpl"
          (attr.class)="$event.resolve(record($event.resolver('extra')))"
        />`,
      })
      class App {
        merged = '';

        protected record(classes: ResolvedAttribute) {
          this.merged = String(classes);
          return classes;
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.merged).toBe('cmp dir tpl extra');
      expect(classesOf(fixture.nativeElement.querySelector('ui-card'))).toEqual([
        'cmp',
        'dir',
        'extra',
        'tpl',
      ]);
    });

    it("from a component's host", async () => {
      let merged = '';

      @Component({
        selector: 'ui-card',
        template: '',
        host: {class: 'cmp', '(attr.class)': `$event.resolve(record($event.resolver('extra')))`},
      })
      class UiCard {
        protected record(classes: ResolvedAttribute) {
          merged = String(classes);
          return classes;
        }
      }

      @Component({
        imports: [UiCard, Tooltip],
        template: `<ui-card tooltip class="tpl" (attr.class)="capture($event.sources)" />`,
      })
      class App {
        sources: ClassSources | null = null;

        protected capture(sources: ClassSources) {
          this.sources = sources;
        }
      }

      const fixture = await render(App);

      expect(merged).toBe('cmp extra dir tpl');
      expect(fixture.componentInstance.sources).toEqual([['cmp', 'extra'], ['dir'], ['tpl']]);
    });

    it("from a directive's host", async () => {
      let merged = '';

      @Component({selector: 'ui-card', template: '', host: {class: 'cmp'}})
      class UiCard {}

      @Directive({
        selector: '[elevated]',
        host: {class: 'dir', '(attr.class)': `$event.resolve(record($event.resolver('extra')))`},
      })
      class Elevated {
        protected record(classes: ResolvedAttribute) {
          merged = String(classes);
          return classes;
        }
      }

      @Component({
        imports: [UiCard, Elevated],
        template: `<ui-card elevated class="tpl" (attr.class)="capture($event.sources)" />`,
      })
      class App {
        sources: ClassSources | null = null;

        protected capture(sources: ClassSources) {
          this.sources = sources;
        }
      }

      const fixture = await render(App);

      expect(merged).toBe('cmp dir extra tpl');
      expect(fixture.componentInstance.sources).toEqual([['cmp'], ['dir', 'extra'], ['tpl']]);
    });
  });

  describe('leaves out names that contain a space', () => {
    for (const [form, value] of [
      ['an array', ['a b', 'c']],
      ['a Set', new Set(['a b', 'c'])],
      ['an object map', {'a b': true, c: true}],
    ] as Array<[string, ClassBindingValue]>) {
      it(`of ${form} passed to resolve()`, async () => {
        @Component({template: `<div class="d" (attr.class)="$event.resolve(value)"></div>`})
        class App {
          protected readonly value = value;
        }

        const fixture = await render(App);

        expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['c']);
      });

      it(`of ${form} passed to the resolver`, async () => {
        @Component({
          template: `<div class="d" (attr.class)="$event.resolve($event.resolver(value))"></div>`,
        })
        class App {
          protected readonly value = value;
        }

        const fixture = await render(App);

        expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['c', 'd']);
      });

      it(`of ${form} that a lower registration resolves`, async () => {
        @Directive({selector: '[lower]', host: {'(attr.class)': '$event.resolve(value)'}})
        class Lower {
          protected readonly value = value;
        }

        @Component({
          imports: [Lower],
          template: `<div lower class="d" (attr.class)="capture($event.sources)"></div>`,
        })
        class App {
          sources: ClassSources | null = null;

          protected capture(sources: ClassSources) {
            this.sources = sources;
          }
        }

        const fixture = await render(App);

        expect(fixture.componentInstance.sources).toEqual([[], ['c'], []]);
      });
    }
  });

  it('resolves again on each refresh with a new event', async () => {
    @Component({template: `<div class="c" (attr.class)="resolveWith($event, size())"></div>`})
    class App {
      readonly size = signal('text-sm');
      readonly events: ClassResolveEvent[] = [];

      protected resolveWith(event: ClassResolveEvent, size: string) {
        this.events.push(event);
        event.resolve(event.resolver(size));
      }
    }

    const fixture = await render(App);
    const div = fixture.nativeElement.querySelector('div');
    const {events} = fixture.componentInstance;
    const firstRefreshes = events.length;
    expect(classesOf(div)).toEqual(['c', 'text-sm']);

    fixture.componentInstance.size.set('text-lg');
    await fixture.whenStable();

    expect(classesOf(div)).toEqual(['c', 'text-lg']);
    expect(events.length).toBeGreaterThan(firstRefreshes);
    expect(new Set(events).size).toBe(events.length);
    expect(() => events[0].resolve('late')).toThrowError(/NG0320/);
  });

  it('seals the event of a handler that throws', async () => {
    const events: ClassResolveEvent[] = [];

    @Component({template: `<div (attr.class)="fail($event)"></div>`})
    class App {
      protected fail(event: ClassResolveEvent) {
        events.push(event);
        throw new Error('Handler failed');
      }
    }

    await expectAsync(render(App)).toBeRejectedWithError(/Handler failed/);

    expect(() => events[0].resolve('late')).toThrowError(/NG0320/);
  });

  @Component({template: `<div (attr.class)="$event.resolve(reentrant($event))"></div>`})
  class ReentrantApp {
    protected reentrant(event: ClassResolveEvent) {
      return {
        get outer() {
          event.resolve('inner');
          return true;
        },
      };
    }
  }

  it('reports a call to resolve() from a value that resolve() reads in dev mode', async () => {
    await expectAsync(render(ReentrantApp)).toBeRejectedWithError(/NG0320/);
  });

  @Component({template: `<div (attr.class)="$event.resolve(reentrant($event))"></div>`})
  class ProxyReentrantApp {
    protected reentrant(event: ClassResolveEvent) {
      return reenteringProxy({outer: true}, () => event.resolve('inner'));
    }
  }

  it('reports a call to resolve() from a check of the value that resolve() makes in dev mode', async () => {
    await expectAsync(render(ProxyReentrantApp)).toBeRejectedWithError(
      /NG0320: .*called `resolve\(\)` more than once/,
    );
  });

  it('reports a result that a refresh before created in dev mode', async () => {
    @Component({template: `<div (attr.class)="resolveWith($event, size())"></div>`})
    class App {
      readonly size = signal('text-sm');
      private kept: ResolvedAttribute | null = null;

      protected resolveWith(event: ClassResolveEvent, size: string) {
        if (size === 'text-sm') {
          this.kept = event.resolver(size);
        }
        event.resolve(this.kept!);
      }
    }

    const fixture = await render(App);
    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['text-sm']);

    fixture.componentInstance.size.set('text-lg');

    await expectAsync(fixture.whenStable()).toBeRejectedWithError(
      /NG0320: .*belongs to another resolve event/,
    );
  });

  it('merges an extra with more classes than a call takes arguments', async () => {
    @Component({template: `<div (attr.class)="$event.resolver(names); $event.resolve('a')"></div>`})
    class App {
      readonly names = Array.from({length: 200_000}, (_, i) => `c${i}`).join(' ');
    }

    const fixture = await render(App);

    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['a']);
  });

  it("calls Angular's joinTokens with more classes than a call takes arguments", async () => {
    TestBed.configureTestingModule({providers: [provideAttributeResolvers({class: joinTokens})]});

    @Component({template: `<div (attr.class)="$event.resolver(names); $event.resolve('a')"></div>`})
    class App {
      readonly names = Array.from({length: 200_000}, (_, i) => `c${i}`).join(' ');
    }

    const fixture = await render(App);

    expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['a']);
  });

  describe('with a result of another resolve event', () => {
    @Component({
      template: `<div
        class="c"
        role="menu"
        (attr.role)="keep($event)"
        (attr.class)="$event.resolve(kept)"
      ></div>`,
    })
    class RoleResultApp {
      kept: ResolvedAttribute | null = null;

      protected keep(event: AttributeResolveEvent) {
        this.kept = event.resolver();
        event.resolve(this.kept);
      }
    }

    it("reports the result of another attribute's event in dev mode", async () => {
      await expectAsync(render(RoleResultApp)).toBeRejectedWithError(
        /NG0320: The `\(attr\.class\)` handler .*belongs to another resolve event/,
      );
    });

    it("reports the classes of another element's event in dev mode", async () => {
      @Component({
        template: `<div (attr.class)="keep($event)"></div>
          <span (attr.class)="$event.resolve(kept)"></span>`,
      })
      class App {
        kept: ResolvedAttribute | null = null;

        protected keep(event: ClassResolveEvent) {
          this.kept = event.resolver('a');
          event.resolve(this.kept);
        }
      }

      await expectAsync(render(App)).toBeRejectedWithError(
        /NG0320: The `\(attr\.class\)` handler .*belongs to another resolve event/,
      );
    });

    it('reports a result passed to the resolver in dev mode', async () => {
      @Component({
        template: `<div
          (attr.class)="$event.resolve($event.resolver($event.resolver('a')))"
        ></div>`,
      })
      class App {}

      await expectAsync(render(App)).toBeRejectedWithError(
        /NG0320: The `\(attr\.class\)` handler passed a result to `resolver\(\)`/,
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

      it("reads the result of another attribute's event as no classes", async () => {
        const fixture = await render(RoleResultApp);

        expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual([]);
      });
    });
  });

  for (const template of [
    `<div (attr.class)="$event.resolve(fn)"></div>`,
    `<div (attr.class)="$event.resolve($event.resolver(fn))"></div>`,
    `<div (class)="(cn) => cn(fn)"></div>`,
  ]) {
    it(`reports a function in ${template} in dev mode`, async () => {
      @Component({template})
      class App {
        readonly fn = () => 'a';
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

    it('ignores a call to resolve() after the handler returns', async () => {
      @Component({template: `<div class="c" (attr.class)="keep($event)"></div>`})
      class App {
        event: ClassResolveEvent | null = null;

        protected keep(event: ClassResolveEvent) {
          this.event = event;
        }
      }

      const fixture = await render(App);

      expect(() => fixture.componentInstance.event!.resolve('late')).not.toThrow();
      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['c']);
    });

    it('applies the last call to resolve() while the handler runs', async () => {
      @Component({template: `<div (attr.class)="$event.resolve('a'); $event.resolve('b')"></div>`})
      class App {}

      const fixture = await render(App);

      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['b']);
    });

    it('applies the call to resolve() from a value that resolve() reads', async () => {
      const fixture = await render(ReentrantApp);

      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['inner']);
    });

    it('applies the call to resolve() from a check of the value that resolve() makes', async () => {
      const fixture = await render(ProxyReentrantApp);

      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['inner']);
    });

    it('leaves out names that contain a space that a lower (class) callback returns', async () => {
      @Directive({selector: '[lower]', host: {'(class)': 'resolve'}})
      class Lower {
        protected readonly resolve = () => ['a b', 'c'] as unknown as ResolvedAttribute;
      }

      @Component({
        imports: [Lower],
        template: `<div lower (attr.class)="resolveWith($event)"></div>`,
      })
      class App {
        sources: ClassSources | null = null;

        protected resolveWith(event: ClassResolveEvent) {
          this.sources = event.sources;
          event.resolve(event.resolver());
        }
      }

      const fixture = await render(App);

      expect(fixture.componentInstance.sources).toEqual([[], ['c'], []]);
      expect(classesOf(fixture.nativeElement.querySelector('div'))).toEqual(['c']);
    });

    it("applies classes from another element's resolver that a (class) callback returns", async () => {
      @Component({
        template: `<div (class)="(keep)"></div>
          <span (class)="(reuse)"></span>`,
      })
      class App {
        private kept: ResolvedAttribute | null = null;
        protected readonly keep = (cn: BoundClassResolver) => (this.kept = cn('a'));
        protected readonly reuse = (cn: BoundClassResolver) => this.kept!;
      }

      const fixture = await render(App);

      expect(classesOf(fixture.nativeElement.querySelector('span'))).toEqual(['a']);
    });
  });

  it('reports a second call to resolve() in dev mode', async () => {
    @Component({template: `<div (attr.class)="$event.resolve('a'); $event.resolve('b')"></div>`})
    class App {}

    await expectAsync(render(App)).toBeRejectedWithError(/NG0320/);
  });

  it('reports a call to resolve() after the handler returns in dev mode', async () => {
    @Component({template: `<div (attr.class)="keep($event)"></div>`})
    class App {
      event: ClassResolveEvent | null = null;

      protected keep(event: ClassResolveEvent) {
        this.event = event;
      }
    }

    const fixture = await render(App);

    expect(() => fixture.componentInstance.event!.resolve('late')).toThrowError(/NG0320/);
  });
});

// @ts-expect-error: only a resolver creates `ResolvedAttribute`, so a string isn't one.
const resolveToString: ClassCallback = (cn) => 'x';

function resolveNumber(event: ClassResolveEvent) {
  // @ts-expect-error: a number is neither a class value nor `ResolvedAttribute`.
  event.resolve(42);
}
