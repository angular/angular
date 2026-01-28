import {NgComponentOutlet} from '@angular/common';
import {By} from '@angular/platform-browser';
import {Component} from '../../../src/core';
import {readPatchedLView} from '../../../src/render3/context_discovery';
import {walkDescendants} from '../../../src/render3/util/view_traversal_utils';
import {HEADER_OFFSET} from '../../../src/render3/interfaces/view';
import {TestBed} from '../../../testing';

describe('view_traversal_util', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  describe('walkDescendants', () => {
    it('yields descendants of the given `LView`', () => {
      @Component({
        selector: 'app-grandchild',
        template: ``,
      })
      class Grandchild {}

      @Component({
        selector: 'app-child1',
        template: ` <app-grandchild /> `,
        imports: [Grandchild],
      })
      class Child1 {}

      @Component({
        selector: 'app-child2',
        template: ``,
      })
      class Child2 {}

      @Component({
        selector: 'app-root',
        template: `
          <app-child1 />
          <app-child2 />
        `,
        imports: [Child1, Child2],
      })
      class Root {}

      const fixture = TestBed.createComponent(Root);
      fixture.detectChanges();
      const root = fixture.debugElement;

      const rootLView = readPatchedLView(fixture.componentInstance)!;
      const descendants = Array.from(walkDescendants(rootLView));

      expect(descendants).toContain(
        readPatchedLView(root.query(By.css('app-child1')).componentInstance)!,
      );
      expect(descendants).toContain(
        readPatchedLView(root.query(By.css('app-child2')).componentInstance)!,
      );
      expect(descendants).toContain(
        readPatchedLView(root.query(By.css('app-grandchild')).componentInstance)!,
      );
      expect(duplicates(descendants)).toHaveSize(0);
    });

    it('yields nothing for components with no descendants', () => {
      @Component({
        selector: 'app-root',
        template: '',
      })
      class Root {}

      const fixture = TestBed.createComponent(Root);
      const rootLView = readPatchedLView(fixture.componentInstance)!;
      const rootComponentLView = rootLView[HEADER_OFFSET];
      const descendants = Array.from(walkDescendants(rootComponentLView));

      expect(descendants).toEqual([]);
      expect(duplicates(descendants)).toHaveSize(0);
    });

    it('yields dynamic descendants', () => {
      @Component({
        selector: 'app-child1',
        template: '',
      })
      class Child1 {}

      @Component({
        selector: 'app-child2',
        template: '',
      })
      class Child2 {}

      @Component({
        selector: 'app-root',
        template: `
          @if (true) {
            <app-child1 />
          }

          <ng-container *ngComponentOutlet="Child2" />
        `,
        imports: [Child1, NgComponentOutlet],
      })
      class Root {
        protected readonly Child2 = Child2;
      }

      const fixture = TestBed.createComponent(Root);
      fixture.detectChanges();

      const root = fixture.debugElement;
      const rootLView = readPatchedLView(fixture.componentInstance)!;
      const descendants = Array.from(walkDescendants(rootLView));

      expect(descendants).toContain(
        readPatchedLView(root.query(By.css('app-child1')).componentInstance)!,
      );
      expect(descendants).toContain(
        readPatchedLView(root.query(By.css('app-child2')).componentInstance)!,
      );
      expect(duplicates(descendants)).toHaveSize(0);
    });

    it('yields projected descendants', () => {
      @Component({
        selector: 'app-projected-child',
        template: ``,
      })
      class ProjectedChild {}

      @Component({
        selector: 'app-projected',
        template: `<app-projected-child />`,
        imports: [ProjectedChild],
      })
      class Projected {}

      @Component({
        selector: 'app-child',
        template: `<ng-content />`,
      })
      class Child {}

      @Component({
        selector: 'app-root',
        template: `
          <app-child>
            <app-projected />
          </app-child>
        `,
        imports: [Child, Projected],
      })
      class Root {}

      const fixture = TestBed.createComponent(Root);
      fixture.detectChanges();

      const root = fixture.debugElement;

      {
        const rootLView = readPatchedLView(fixture.componentInstance)!;
        const descendants = Array.from(walkDescendants(rootLView));

        expect(descendants).toContain(
          readPatchedLView(root.query(By.css('app-projected')).componentInstance)!,
        );
        expect(descendants).toContain(
          readPatchedLView(root.query(By.css('app-projected-child')).componentInstance)!,
        );
        expect(duplicates(descendants)).toHaveSize(0);
      }

      // Check for views projected from ancestors outside the root.
      {
        const childLView = readPatchedLView(
          fixture.debugElement.query(By.css('app-child'))!.componentInstance,
        )!;
        const descendants = Array.from(walkDescendants(childLView));

        expect(descendants).toContain(
          readPatchedLView(root.query(By.css('app-projected')).componentInstance)!,
        );
        expect(descendants).toContain(
          readPatchedLView(root.query(By.css('app-projected-child')).componentInstance)!,
        );
        expect(duplicates(descendants)).toHaveSize(0);
      }
    });
  });
});

function duplicates<T>(items: Iterable<T>): Set<T> {
  const seen = new Set<T>();
  const duplicates = new Set<T>();
  for (const item of items) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }

  return duplicates;
}
