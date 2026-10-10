/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, Input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/private/testing/matchers';

describe('integration tests', () => {
  let fixture: ComponentFixture<TestComponent>;

  describe('directives', () => {
    it('should support dotted selectors', async () => {
      @Directive({
        selector: '[dot.name]',
        standalone: false,
      })
      class MyDir {
        @Input('dot.name') value!: string;
      }

      TestBed.configureTestingModule({
        declarations: [MyDir, TestComponent],
      });

      const template = `<div [dot.name]="'foo'"></div>`;
      fixture = createTestComponent(template);
      await fixture.whenStable();
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      expect(myDir.value).toEqual('foo');
    });
  });

  describe('ng-container', () => {
    it('should work regardless the namespace', async () => {
      @Component({
        selector: 'comp',
        template:
          '<svg><ng-container *ngIf="1"><rect x="10" y="10" width="30" height="30"></rect></ng-container></svg>',
        standalone: false,
      })
      class MyCmp {}

      const f = TestBed.configureTestingModule({declarations: [MyCmp]}).createComponent(MyCmp);
      await f.whenStable();

      expect(f.nativeElement.children[0].children[0].tagName).toEqual('rect');
    });
  });

  describe('HTML entities', () => {
    it('should not treat entity-encoded braces as interpolation', async () => {
      @Component({
        selector: 'test-comp',
        template: '&lbrace;&lbrace; &rbrace;&rbrace;',
      })
      class TestCmp {}

      const fixture = TestBed.createComponent(TestCmp);
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toBe('{{ }}');
    });

    it('should handle entity-encoded braces in attributes', async () => {
      @Component({
        selector: 'test-comp',
        template: '<div title="&lbrace;&lbrace; value &rbrace;&rbrace;"></div>',
      })
      class TestCmp {}

      const fixture = TestBed.createComponent(TestCmp);
      await fixture.whenStable();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('title')).toBe('{{ value }}');
    });

    it('should render entity-encoded braces as plain text', async () => {
      @Component({
        selector: 'test-comp',
        template: '&lbrace;&lbrace;message&rbrace;&rbrace;',
      })
      class TestCmp {
        message = 'Hello';
      }

      const fixture = TestBed.createComponent(TestCmp);
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toBe('{{message}}');
    });
  });
});

@Component({
  selector: 'test-cmp',
  template: '',
  standalone: false,
})
class TestComponent {}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}}).createComponent(
    TestComponent,
  );
}
