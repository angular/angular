/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

describe('directives', () => {

  describe('matching', () => {

    @Directive({selector: 'ng-template[test]'})
    class TestDirective {
    }

    @Directive({selector: '[title]'})
    class TitleDirective {
    }

    @Component({selector: 'test-cmpt', template: ''})
    class TestComponent {
    }

    it('should match directives on ng-template', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TestDirective]});
      TestBed.overrideTemplate(TestComponent, `<ng-template test></ng-template>`);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TestDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match directives on ng-template created by * syntax', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TestDirective]});
      TestBed.overrideTemplate(TestComponent, `<div *test></div>`);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TestDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match directives on i18n-annotated attributes', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(TestComponent, `
        <div title="My title" i18n-title="Title translation description"></div>
      `);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should match a mix of bound directives and classes', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(TestComponent, `
        <div class="one two" [id]="someId" [title]="title"></div>
      `);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(1);
    });

    it('should NOT match classes to directive selectors', () => {
      TestBed.configureTestingModule({declarations: [TestComponent, TitleDirective]});
      TestBed.overrideTemplate(TestComponent, `
        <div class="title" [id]="someId"></div>
      `);

      const fixture = TestBed.createComponent(TestComponent);
      const nodesWithDirective = fixture.debugElement.queryAllNodes(By.directive(TitleDirective));

      expect(nodesWithDirective.length).toBe(0);
    });

  });

});
