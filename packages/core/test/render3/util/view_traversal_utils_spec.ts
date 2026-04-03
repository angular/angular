/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '../../../src/metadata/directives';
import {TestBed} from '@angular/core/testing';
import {walkLViewDirectives} from '../../../src/render3/util/view_traversal_utils';
import {getLContext} from '../../../src/render3/context_discovery';

describe('view_traversal_utils', () => {
  describe('walkLViewDirectives', () => {
    it('should yield all components in the view hierarchy', async () => {
      @Component({
        selector: 'child-comp',
        template: '<b>Child</b>',
      })
      class ChildComponent {}

      @Component({
        selector: 'test-comp',
        template: '<div><child-comp></child-comp></div>',
        imports: [ChildComponent],
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();

      const lView = getLContext(fixture.nativeElement)!.lView!;
      const directives = Array.from(walkLViewDirectives(lView));
      const values = directives.map(([node]) => node.value);

      expect(values).toContain('child-comp');
      expect(values).not.toContain('div');
      expect(values).not.toContain('b');
    });

    it('should handle embedded views in a container', async () => {
      @Component({
        selector: 'child-comp',
        template: '<b>Child</b>',
      })
      class ChildComponent {}

      @Component({
        selector: 'test-comp',
        template: '<div>@if (show) {<child-comp></child-comp>}</div>',
        imports: [ChildComponent],
      })
      class TestComponent {
        show = true;
      }

      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();

      const lView = getLContext(fixture.nativeElement)!.lView!;
      const directives = Array.from(walkLViewDirectives(lView));
      const values = directives.map(([node]) => node.value);

      expect(values).toContain('child-comp');
    });

    it('should handle content projection', async () => {
      @Component({
        selector: 'projected-comp',
        template: '<b>Projected</b>',
      })
      class ProjectedComponent {}

      @Component({
        selector: 'projector-comp',
        template: '<div class="projector"><ng-content></ng-content></div>',
      })
      class ProjectorComponent {}

      @Component({
        selector: 'test-comp',
        template: '<projector-comp><projected-comp></projected-comp></projector-comp>',
        imports: [ProjectorComponent, ProjectedComponent],
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();

      const lView = getLContext(fixture.nativeElement)!.lView!;
      const directives = Array.from(walkLViewDirectives(lView));
      const values = directives.map(([node]) => node.value);

      expect(values).toContain('projector-comp');
      expect(values).toContain('projected-comp');
    });
  });
});
