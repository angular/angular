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
  Directive,
  inject,
  joinValues,
  provideAttributeResolvers,
  Renderer2,
  ResolvedAttribute,
  signal,
  Type,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

interface TokenListResolveEvent {
  readonly sources: readonly [
    component: readonly string[],
    directives: readonly string[],
    template: readonly string[],
  ];
  resolver(...extras: Array<string | readonly string[]>): ResolvedAttribute;
  resolve(value: string | readonly string[] | ResolvedAttribute | null): void;
}

async function render<T>(component: Type<T>) {
  const fixture = TestBed.createComponent(component);
  await fixture.whenStable();
  return fixture;
}

@Directive({selector: '[hint]', host: {'aria-describedby': 'hint shared'}})
class Hint {}

@Directive({selector: '[errors]', host: {'[attr.aria-describedby]': 'ids()'}})
class Errors {
  readonly ids = signal<string | null>('shared error');
}

describe('(attr.x) binding of an attribute that holds a list of tokens', () => {
  it("joins two directives' tokens without duplicates, in match order", async () => {
    @Component({
      imports: [Hint, Errors],
      template: `<input hint errors (attr.aria-describedby)="record($event)" />`,
    })
    class App {
      sources: TokenListResolveEvent['sources'] | null = null;

      protected record(event: TokenListResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([
      [],
      ['hint', 'shared', 'shared', 'error'],
      [],
    ]);
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-describedby')).toBe(
      'hint shared error',
    );
  });

  it("joins the tokens when the handler doesn't call resolve()", async () => {
    @Component({
      imports: [Hint, Errors],
      template: `<input hint errors aria-describedby="own" (attr.aria-describedby)="ignore()" />`,
    })
    class App {
      protected ignore() {}
    }

    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-describedby')).toBe(
      'hint shared error own',
    );
  });

  it("writes the attribute only when the joined tokens change, as a contributor's binding changes", async () => {
    @Component({
      imports: [Hint, Errors],
      template: `<input hint errors (attr.aria-describedby)="$event.resolve($event.resolver())" />`,
    })
    class App {
      readonly renderer = inject(Renderer2);
    }

    const fixture = await render(App);
    const input = fixture.nativeElement.querySelector('input');
    const errors = fixture.debugElement.children[0].injector.get(Errors);
    const renderer = fixture.componentInstance.renderer;
    const setAttribute = spyOn(renderer, 'setAttribute').and.callThrough();
    const removeAttribute = spyOn(renderer, 'removeAttribute').and.callThrough();

    errors.ids.set('error shared');
    await fixture.whenStable();

    expect(setAttribute).not.toHaveBeenCalled();
    expect(input.getAttribute('aria-describedby')).toBe('hint shared error');

    errors.ids.set(null);
    await fixture.whenStable();

    expect(setAttribute.calls.allArgs()).toEqual([[input, 'aria-describedby', 'hint shared']]);
    expect(removeAttribute).not.toHaveBeenCalled();
  });

  it('removes the attribute when the tokens resolve to an empty string', async () => {
    @Component({
      imports: [Hint],
      template: `<input hint (attr.aria-describedby)="$event.resolve('')" />`,
    })
    class App {}

    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-describedby')).toBe(
      false,
    );
  });

  it("folds the tokens that a lower-priority binding resolves into the sources that gave them, or else into its owner's", async () => {
    @Directive({
      selector: '[described]',
      host: {
        'aria-describedby': 'hint shared',
        '(attr.aria-describedby)': "$event.resolve($event.resolver('own', ['tpl']))",
      },
    })
    class Described {}

    @Component({
      imports: [Described],
      template: `<input
        described
        aria-describedby="tpl"
        (attr.aria-describedby)="record($event)"
      />`,
    })
    class App {
      sources: TokenListResolveEvent['sources'] | null = null;

      protected record(event: TokenListResolveEvent) {
        this.sources = event.sources;
        event.resolve(event.resolver());
      }
    }

    const fixture = await render(App);

    expect(fixture.componentInstance.sources).toEqual([[], ['hint', 'shared', 'own'], ['tpl']]);
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-describedby')).toBe(
      'hint shared own tpl',
    );
  });

  it("calls the app's resolver with one argument per token, the extras at the end of the caller's source", async () => {
    const resolver = jasmine
      .createSpy<AttributeResolver>('resolver')
      .and.callFake((...tokens) => tokens.join('+'));
    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({'aria-describedby': resolver})],
    });

    @Component({
      imports: [Hint],
      template: `<input
        hint
        aria-describedby="tpl"
        (attr.aria-describedby)="$event.resolve($event.resolver('a b', ['c d', 'e']))"
      />`,
    })
    class App {}

    const fixture = await render(App);

    expect(resolver.calls.allArgs()).toEqual([['hint', 'shared', 'tpl', 'a', 'b', 'c', 'd', 'e']]);
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-describedby')).toBe(
      'hint+shared+tpl+a+b+c+d+e',
    );
  });

  describe('folds the tokens that a lower-priority binding resolves', () => {
    function appWith(described: Type<unknown>) {
      @Component({
        imports: [described],
        template: `<input
          described
          aria-describedby="shared tpl"
          (attr.aria-describedby)="record($event)"
        />`,
      })
      class App {
        sources: TokenListResolveEvent['sources'] | null = null;

        protected record(event: TokenListResolveEvent) {
          this.sources = event.sources;
          event.resolve(event.resolver());
        }
      }
      return App;
    }

    it('into the higher-priority source of a token that two sources share', async () => {
      @Directive({
        selector: '[described]',
        host: {
          'aria-describedby': 'hint shared',
          '(attr.aria-describedby)': '$event.resolve($event.resolver())',
        },
      })
      class Described {}

      const fixture = await render(appWith(Described));

      expect(fixture.componentInstance.sources).toEqual([[], ['hint'], ['shared', 'tpl']]);
      expect(fixture.nativeElement.querySelector('input').getAttribute('aria-describedby')).toBe(
        'hint shared tpl',
      );
    });

    it('into no source when it is null', async () => {
      @Directive({
        selector: '[described]',
        host: {
          'aria-describedby': 'hint shared',
          '(attr.aria-describedby)': '$event.resolve(null)',
        },
      })
      class Described {}

      const fixture = await render(appWith(Described));

      expect(fixture.componentInstance.sources).toEqual([[], [], []]);
      expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-describedby')).toBe(
        false,
      );
    });
  });

  it('collects and merges more tokens than a call takes arguments', async () => {
    @Component({
      template: `<div
        [attr.aria-describedby]="ids"
        (attr.aria-describedby)="$event.resolver(ids); $event.resolve('a')"
      ></div>`,
    })
    class App {
      readonly ids = Array.from({length: 200_000}, (_, i) => `t${i}`).join(' ');
    }

    const fixture = await render(App);

    expect(fixture.nativeElement.querySelector('div').getAttribute('aria-describedby')).toBe('a');
  });

  it("joins more tokens than a call takes arguments when the handler doesn't call resolve()", async () => {
    @Component({
      template: `<div [attr.aria-describedby]="ids" (attr.aria-describedby)="ignore()"></div>`,
    })
    class App {
      readonly ids = Array.from({length: 200_000}, (_, i) => `t${i}`).join(' ');
      protected ignore() {}
    }

    const fixture = await render(App);

    const tokens = fixture.nativeElement.querySelector('div').getAttribute('aria-describedby');
    expect(tokens.split(' ').length).toBe(200_000);
  });

  it('calls a joinValues resolver with more tokens than a call takes arguments', async () => {
    TestBed.configureTestingModule({
      providers: [provideAttributeResolvers({'aria-describedby': joinValues(' ')})],
    });

    @Component({
      template: `<div
        [attr.aria-describedby]="ids"
        (attr.aria-describedby)="$event.resolve($event.resolver())"
      ></div>`,
    })
    class App {
      readonly ids = Array.from({length: 200_000}, (_, i) => `t${i}`).join(' ');
    }

    const fixture = await render(App);

    const tokens = fixture.nativeElement.querySelector('div').getAttribute('aria-describedby');
    expect(tokens.split(' ').length).toBe(200_000);
  });

  it("doesn't warn about two directives' different tokens", async () => {
    const warn = spyOn(console, 'warn');

    @Component({
      imports: [Hint, Errors],
      template: `<input hint errors (attr.aria-describedby)="$event.resolve($event.resolver())" />`,
    })
    class App {}

    await render(App);

    expect(warn).not.toHaveBeenCalled();
  });
});
