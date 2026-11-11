/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  Input,
  provideAttributeResolvers,
  Provider,
  signal,
  withAutoResolution,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

/** Stand-in for `cn` (`clsx` and `tailwind-merge`). */
export function cn(...inputs: string[]): string {
  const byPrefix = new Map<string, string>();
  for (const className of inputs.join(' ').split(/\s+/).filter(Boolean)) {
    const prefix = className.split('-')[0];
    byPrefix.delete(prefix);
    byPrefix.set(prefix, className);
  }
  return [...byPrefix.values()].join(' ');
}

export function classesOf(element: Element): string[] {
  return Array.from(element.classList).sort();
}

/**
 * The `attribute_resolver` target runs these specs without automatic resolution, and the
 * `auto_resolution` target runs them with automatic resolution in the root providers.
 */
export function describeOffSubtree(rootProviders: () => Provider[]): void {
  describe('in a subtree that provides the resolver without automatic resolution', () => {
    @Directive({
      selector: '[tone]',
      host: {
        'class': 'px-2 tone',
        '[class.raised]': 'raised',
        '[class]': "raised ? 'py-1' : 'py-2'",
      },
    })
    class Tone {
      @Input() raised = true;
    }

    @Component({
      selector: 'ui-chip',
      template: '',
      host: {'class': 'px-2 chip', '[class.selected]': 'selected'},
    })
    class UiChip {
      @Input() selected = false;
    }

    @Directive({selector: '[classInput]'})
    class ClassInput {
      @Input() class = '';
    }

    @Component({
      selector: 'legacy-panel',
      imports: [Tone, UiChip, ClassInput],
      providers: [provideAttributeResolvers({class: cn}, withAutoResolution(false))],
      template: `
        <div
          id="bound"
          tone
          [raised]="active()"
          class="px-4 static"
          [class]="classes()"
          [class.active]="active()"
        ></div>
        <ui-chip id="chip" class="px-4" [selected]="!active()" [class.wide]="active()" />
        <div id="input" classInput class="px-4" [class]="classes()"></div>
        @if (active() || !active()) {
          <p id="nested" tone class="px-4"></p>
        }
      `,
    })
    class LegacyPanel {
      readonly classes = signal('m-1 m-2');
      readonly active = signal(true);
    }

    @Component({imports: [LegacyPanel], template: '<legacy-panel />'})
    class App {}

    it('applies static classes, class bindings, and host class bindings like Angular without a resolver', async () => {
      TestBed.configureTestingModule({providers: rootProviders()});
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const element = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as Element;

      expect(classesOf(element('bound'))).toEqual([
        'active',
        'm-1',
        'm-2',
        'px-2',
        'px-4',
        'py-1',
        'raised',
        'static',
        'tone',
      ]);
      expect(classesOf(element('chip'))).toEqual(['chip', 'px-2', 'px-4', 'wide']);
      expect(classesOf(element('input'))).toEqual(['px-4']);
      expect(classesOf(element('nested'))).toEqual(['px-2', 'px-4', 'py-1', 'raised', 'tone']);

      const panel = fixture.debugElement.children[0].componentInstance as LegacyPanel;
      panel.classes.set('m-3');
      panel.active.set(false);
      await fixture.whenStable();

      expect(classesOf(element('bound'))).toEqual([
        'm-3',
        'px-2',
        'px-4',
        'py-2',
        'static',
        'tone',
      ]);
      expect(classesOf(element('chip'))).toEqual(['chip', 'px-2', 'px-4', 'selected']);
      expect(classesOf(element('input'))).toEqual(['px-4']);
      expect(classesOf(element('nested'))).toEqual(['px-2', 'px-4', 'py-1', 'raised', 'tone']);
    });

    it('passes [class] to a class input like Angular without a resolver', async () => {
      TestBed.configureTestingModule({providers: rootProviders()});
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const input = () =>
        fixture.debugElement
          .query((debugElement) => debugElement.attributes['id'] === 'input')
          .injector.get(ClassInput);

      expect(input().class).toBe('px-4 m-1 m-2');

      const panel = fixture.debugElement.children[0].componentInstance as LegacyPanel;
      panel.classes.set('m-3');
      await fixture.whenStable();

      expect(input().class).toBe('px-4 m-3');
    });
  });
}
