/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵsetEnabledBlockTypes as setEnabledBlockTypes} from '@angular/compiler/src/jit_compiler_facade';
import {Component, Input, QueryList, ViewChildren, ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('#defer', () => {
  beforeEach(() => setEnabledBlockTypes(['defer']));
  afterEach(() => setEnabledBlockTypes([]));

  it('should transition between placeholder, loading and loaded states', async () => {
    @Component({
      selector: 'my-lazy-cmp',
      standalone: true,
      template: 'Hi!',
    })
    class MyLazyCmp {
    }

    @Component({
      standalone: true,
      selector: 'simple-app',
      imports: [MyLazyCmp],
      template: `
        {#defer when isVisible}
          <my-lazy-cmp />
        {:loading}
          Loading...
        {:placeholder}
          Placeholder!
        {:error}
          Failed to load dependencies :(
        {/defer}
      `
    })
    class MyCmp {
      isVisible = false;
    }

    const fixture = TestBed.createComponent(MyCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

    fixture.componentInstance.isVisible = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('Loading');

    // Wait for dependencies to load.
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('<my-lazy-cmp>Hi!</my-lazy-cmp>');
  });

  it('should work when only main block is present', async () => {
    @Component({
      selector: 'my-lazy-cmp',
      standalone: true,
      template: 'Hi!',
    })
    class MyLazyCmp {
    }

    @Component({
      standalone: true,
      selector: 'simple-app',
      imports: [MyLazyCmp],
      template: `
        <p>Text outside of a defer block</p>
        {#defer when isVisible}
          <my-lazy-cmp />
        {/defer}
      `
    })
    class MyCmp {
      isVisible = false;
    }

    const fixture = TestBed.createComponent(MyCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('Text outside of a defer block');

    fixture.componentInstance.isVisible = true;
    fixture.detectChanges();

    // Wait for dependencies to load.
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('<my-lazy-cmp>Hi!</my-lazy-cmp>');
  });


  describe('directive matching', () => {
    it('should support directive matching in all blocks', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [NestedCmp],
        template: `
        {#defer when isVisible}
          <nested-cmp [block]="'primary'" />
        {:loading}
          Loading...
          <nested-cmp [block]="'loading'" />
        {:placeholder}
          Placeholder!
          <nested-cmp [block]="'placeholder'" />
        {:error}
          Failed to load dependencies :(
          <nested-cmp [block]="'error'" />
        {/defer}
      `
      })
      class MyCmp {
        isVisible = false;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="placeholder">Rendering placeholder block.</nested-cmp>');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="loading">Rendering loading block.</nested-cmp>');

      // Wait for dependencies to load.
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>');
    });
  });

  describe('error handling', () => {
    it('should render an error block when loading fails', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [NestedCmp],
        template: `
            {#defer when isVisible}
              <nested-cmp [block]="'primary'" />
            {:loading}
              Loading...
            {:placeholder}
              Placeholder!
            {:error}
              Failed to load dependencies :(
              <nested-cmp [block]="'error'" />
            {/defer}
          `
      })
      class MyCmp {
        isVisible = false;
        @ViewChildren(NestedCmp) cmps!: QueryList<NestedCmp>;
      }

      const deferDepsInterceptor = {
        intercept() {
          // Simulate loading failure.
          return () => [Promise.reject()];
        }
      };

      TestBed.configureTestingModule({
        providers: [
          {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
        ]
      });

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Loading');

      // Wait for dependencies to load.
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify that the error block is rendered.
      // Also verify that selector matching works in an error block.
      expect(fixture.nativeElement.outerHTML)
          .toContain('<nested-cmp ng-reflect-block="error">Rendering error block.</nested-cmp>');

      // Verify that queries work within an error block.
      expect(fixture.componentInstance.cmps.length).toBe(1);
      expect(fixture.componentInstance.cmps.get(0)?.block).toBe('error');
    });
  });

  describe('queries', () => {
    it('should query for components within each block', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [NestedCmp],
        template: `
          {#defer when isVisible}
            <nested-cmp [block]="'primary'" />
          {:loading}
            Loading...
            <nested-cmp [block]="'loading'" />
          {:placeholder}
            Placeholder!
            <nested-cmp [block]="'placeholder'" />
          {:error}
            Failed to load dependencies :(
            <nested-cmp [block]="'error'" />
          {/defer}
        `
      })
      class MyCmp {
        isVisible = false;

        @ViewChildren(NestedCmp) cmps!: QueryList<NestedCmp>;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.componentInstance.cmps.length).toBe(1);
      expect(fixture.componentInstance.cmps.get(0)?.block).toBe('placeholder');
      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="placeholder">Rendering placeholder block.</nested-cmp>');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.cmps.length).toBe(1);
      expect(fixture.componentInstance.cmps.get(0)?.block).toBe('loading');
      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="loading">Rendering loading block.</nested-cmp>');

      // Wait for dependencies to load.
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.componentInstance.cmps.length).toBe(1);
      expect(fixture.componentInstance.cmps.get(0)?.block).toBe('primary');
      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>');
    });
  });

  describe('content projection', () => {
    it('should be able to project content into each block', async () => {
      @Component({
        selector: 'cmp-a',
        standalone: true,
        template: 'CmpA',
      })
      class CmpA {
      }

      @Component({
        selector: 'cmp-b',
        standalone: true,
        template: 'CmpB',
      })
      class CmpB {
      }

      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'my-app',
        imports: [NestedCmp],
        template: `
          {#defer when isVisible}
            <nested-cmp [block]="'primary'" />
            <ng-content />
          {:loading}
            Loading...
            <nested-cmp [block]="'loading'" />
          {:placeholder}
            Placeholder!
            <nested-cmp [block]="'placeholder'" />
          {:error}
            Failed to load dependencies :(
            <nested-cmp [block]="'error'" />
          {/defer}
        `
      })
      class MyCmp {
        @Input() isVisible = false;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [MyCmp, CmpA, CmpB],
        template: `
          <my-app [isVisible]="isVisible">
            Projected content.
            <b>Including tags</b>
            <cmp-a />
            {#defer when isInViewport}
              <cmp-b />
            {:placeholder}
              Projected defer block placeholder.
            {/defer}
          </my-app>
        `
      })
      class RootCmp {
        isVisible = false;
        isInViewport = false;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="placeholder">Rendering placeholder block.</nested-cmp>');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="loading">Rendering loading block.</nested-cmp>');

      // Wait for dependencies to load.
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify primary block content.
      const primaryBlockHTML = fixture.nativeElement.outerHTML;
      expect(primaryBlockHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>');
      expect(primaryBlockHTML).toContain('Projected content.');
      expect(primaryBlockHTML).toContain('<b>Including tags</b>');
      expect(primaryBlockHTML).toContain('<cmp-a>CmpA</cmp-a>');
      expect(primaryBlockHTML).toContain('Projected defer block placeholder.');

      fixture.componentInstance.isInViewport = true;
      fixture.detectChanges();

      // Wait for projected block dependencies to load.
      await fixture.whenStable();
      fixture.detectChanges();

      // Nested defer block was triggered and the `CmpB` content got rendered.
      expect(fixture.nativeElement.outerHTML).toContain('<cmp-b>CmpB</cmp-b>');
    });
  });

  describe('nested blocks', () => {
    it('should be able to have nested blocks', async () => {
      @Component({
        selector: 'cmp-a',
        standalone: true,
        template: 'CmpA',
      })
      class CmpA {
      }

      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp, CmpA],
        template: `
         {#defer when isVisible}
            <nested-cmp [block]="'primary'" />
            {#defer when isInViewport}
              <cmp-a />
            {:placeholder}
              Nested defer block placeholder.
            {/defer}
          {:placeholder}
            <nested-cmp [block]="'placeholder'" />
          {/defer}
        `
      })
      class RootCmp {
        isVisible = false;
        isInViewport = false;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="placeholder">Rendering placeholder block.</nested-cmp>');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      await fixture.whenStable();  // loading dependencies for the defer block within MyCmp...
      fixture.detectChanges();

      // Verify primary block content.
      const primaryBlockHTML = fixture.nativeElement.outerHTML;
      expect(primaryBlockHTML)
          .toContain(
              '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>');

      // Make sure we have a nested block in a placeholder state.
      expect(primaryBlockHTML).toContain('Nested defer block placeholder.');

      // Trigger condition for the nested block.
      fixture.componentInstance.isInViewport = true;
      fixture.detectChanges();

      // Wait for nested block dependencies to load.
      await fixture.whenStable();
      fixture.detectChanges();

      // Nested defer block was triggered and the `CmpB` content got rendered.
      expect(fixture.nativeElement.outerHTML).toContain('<cmp-a>CmpA</cmp-a>');
    });
  });
});
