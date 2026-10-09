/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy} from '@angular/compiler';
import {Attribute, Component, Directive, TemplateRef, Type, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet} from '../../index';

describe('NgSwitch', () => {
  let fixture: ComponentFixture<any>;

  function getComponent(): TestComponent {
    return fixture.componentInstance;
  }

  async function detectChangesAndExpectText(text: string): Promise<void> {
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText(text);
  }

  afterEach(() => {
    fixture = null!;
  });

  describe('switch value changes', () => {
    it('should switch amongst when values', async () => {
      const template =
        '<ul [ngSwitch]="switchValue">' +
        '<li *ngSwitchCase="\'a\'">when a</li>' +
        '<li *ngSwitchCase="\'b\'">when b</li>' +
        '</ul>';

      fixture = createTestComponent(template);

      await detectChangesAndExpectText('');

      getComponent().switchValue = 'a';
      await detectChangesAndExpectText('when a');

      getComponent().switchValue = 'b';
      await detectChangesAndExpectText('when b');
    });

    it('should switch amongst when values with fallback to default', async () => {
      const template =
        '<ul [ngSwitch]="switchValue">' +
        '<li *ngSwitchCase="\'a\'">when a</li>' +
        '<li *ngSwitchDefault>when default</li>' +
        '</ul>';

      fixture = createTestComponent(template);
      await detectChangesAndExpectText('when default');

      getComponent().switchValue = 'a';
      await detectChangesAndExpectText('when a');

      getComponent().switchValue = 'b';
      await detectChangesAndExpectText('when default');

      getComponent().switchValue = 'c';
      await detectChangesAndExpectText('when default');
    });

    it('should support multiple whens with the same value', async () => {
      const template =
        '<ul [ngSwitch]="switchValue">' +
        '<li *ngSwitchCase="\'a\'">when a1;</li>' +
        '<li *ngSwitchCase="\'b\'">when b1;</li>' +
        '<li *ngSwitchCase="\'a\'">when a2;</li>' +
        '<li *ngSwitchCase="\'b\'">when b2;</li>' +
        '<li *ngSwitchDefault>when default1;</li>' +
        '<li *ngSwitchDefault>when default2;</li>' +
        '</ul>';

      fixture = createTestComponent(template);
      await detectChangesAndExpectText('when default1;when default2;');

      getComponent().switchValue = 'a';
      await detectChangesAndExpectText('when a1;when a2;');

      getComponent().switchValue = 'b';
      await detectChangesAndExpectText('when b1;when b2;');
    });

    it('should use === to match cases', async () => {
      const template =
        '<ul [ngSwitch]="switchValue">' +
        '<li *ngSwitchCase="1">when one</li>' +
        '<li *ngSwitchDefault>when default</li>' +
        '</ul>';

      fixture = createTestComponent(template);
      await detectChangesAndExpectText('when default');

      getComponent().switchValue = 1;
      await detectChangesAndExpectText('when one');

      getComponent().switchValue = '1';
      await detectChangesAndExpectText('when default');
    });
  });

  describe('when values changes', () => {
    it('should switch amongst when values', async () => {
      const template =
        '<ul [ngSwitch]="switchValue">' +
        '<li *ngSwitchCase="when1">when 1;</li>' +
        '<li *ngSwitchCase="when2">when 2;</li>' +
        '<li *ngSwitchDefault>when default;</li>' +
        '</ul>';

      fixture = createTestComponent(template);
      getComponent().when1 = 'a';
      getComponent().when2 = 'b';
      getComponent().switchValue = 'a';
      await detectChangesAndExpectText('when 1;');

      getComponent().switchValue = 'b';
      await detectChangesAndExpectText('when 2;');

      getComponent().switchValue = 'c';
      await detectChangesAndExpectText('when default;');

      getComponent().when1 = 'c';
      await detectChangesAndExpectText('when 1;');

      getComponent().when1 = 'd';
      await detectChangesAndExpectText('when default;');
    });
  });

  it('should be available as standalone directives', async () => {
    @Component({
      imports: [NgSwitch, NgSwitchCase, NgSwitchDefault],
      template:
        '<ul [ngSwitch]="switchValue">' +
        '<li *ngSwitchCase="\'a\'">when a</li>' +
        '<li *ngSwitchDefault>when default</li>' +
        '</ul>',
      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestComponent {
      switchValue = 'a';
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('when a');

    fixture.componentInstance.switchValue = 'b';
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('when default');

    fixture.componentInstance.switchValue = 'c';
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('when default');
  });

  describe('corner cases', () => {
    it('should not create the default case if another case matches', async () => {
      const log: string[] = [];

      @Directive({
        selector: '[test]',
      })
      class TestDirective {
        constructor(@Attribute('test') test: string) {
          log.push(test);
        }
      }

      const template =
        '<div [ngSwitch]="switchValue">' +
        '<div *ngSwitchCase="\'a\'" test="aCase"></div>' +
        '<div *ngSwitchDefault test="defaultCase"></div>' +
        '</div>';

      const fixture = createTestComponent(template, [TestDirective]);
      fixture.componentInstance.switchValue = 'a';

      await fixture.whenStable();

      expect(log).toEqual(['aCase']);
    });

    it('should create the default case if there is no other case', async () => {
      const template =
        '<ul [ngSwitch]="switchValue">' +
        '<li *ngSwitchDefault>when default1;</li>' +
        '<li *ngSwitchDefault>when default2;</li>' +
        '</ul>';

      fixture = createTestComponent(template);
      await detectChangesAndExpectText('when default1;when default2;');
    });

    it('should allow defaults before cases', async () => {
      const template =
        '<ul [ngSwitch]="switchValue">' +
        '<li *ngSwitchDefault>when default1;</li>' +
        '<li *ngSwitchDefault>when default2;</li>' +
        '<li *ngSwitchCase="\'a\'">when a1;</li>' +
        '<li *ngSwitchCase="\'b\'">when b1;</li>' +
        '<li *ngSwitchCase="\'a\'">when a2;</li>' +
        '<li *ngSwitchCase="\'b\'">when b2;</li>' +
        '</ul>';

      fixture = createTestComponent(template);
      await detectChangesAndExpectText('when default1;when default2;');

      getComponent().switchValue = 'a';
      await detectChangesAndExpectText('when a1;when a2;');

      getComponent().switchValue = 'b';
      await detectChangesAndExpectText('when b1;when b2;');
    });

    it('should throw error when ngSwitchCase is used outside of ngSwitch', () => {
      const template = '<div [ngSwitch]="switchValue"></div>' + '<div *ngSwitchCase="\'a\'"></div>';

      expect(() => createTestComponent(template)).toThrowError(
        'NG02000: An element with the "ngSwitchCase" attribute (matching the "NgSwitchCase" directive) must be located inside an element with the "ngSwitch" attribute (matching "NgSwitch" directive)',
      );
    });

    it('should throw error when ngSwitchDefault is used outside of ngSwitch', () => {
      const template = '<div [ngSwitch]="switchValue"></div>' + '<div *ngSwitchDefault></div>';

      expect(() => createTestComponent(template)).toThrowError(
        'NG02000: An element with the "ngSwitchDefault" attribute (matching the "NgSwitchDefault" directive) must be located inside an element with the "ngSwitch" attribute (matching "NgSwitch" directive)',
      );
    });

    it('should support nested NgSwitch on ng-container with ngTemplateOutlet', async () => {
      fixture = TestBed.createComponent(ComplexComponent);
      await detectChangesAndExpectText('Foo');

      fixture.componentInstance.state = 'case2';
      await detectChangesAndExpectText('Bar');

      fixture.componentInstance.state = 'notACase';
      await detectChangesAndExpectText('Default');

      fixture.componentInstance.state = 'case1';
      await detectChangesAndExpectText('Foo');
    });
  });
});

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestComponent {
  switchValue: any = null;
  when1: any = null;
  when2: any = null;
}

@Component({
  template: `
    <div [ngSwitch]="state">
      <ng-container *ngSwitchCase="'case1'" [ngSwitch]="true">
        <ng-container *ngSwitchCase="true" [ngTemplateOutlet]="foo"></ng-container>
        <span *ngSwitchDefault>Should never render</span>
      </ng-container>
      <ng-container *ngSwitchCase="'case2'" [ngSwitch]="true">
        <ng-container *ngSwitchCase="true" [ngTemplateOutlet]="bar"></ng-container>
        <span *ngSwitchDefault>Should never render</span>
      </ng-container>
      <ng-container *ngSwitchDefault [ngSwitch]="false">
        <ng-container *ngSwitchCase="true" [ngTemplateOutlet]="foo"></ng-container>
        <span *ngSwitchDefault>Default</span>
      </ng-container>
    </div>

    <ng-template #foo>
      <span>Foo</span>
    </ng-template>
    <ng-template #bar>
      <span>Bar</span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet],
})
class ComplexComponent {
  @ViewChild('foo', {static: true}) foo!: TemplateRef<any>;
  @ViewChild('bar', {static: true}) bar!: TemplateRef<any>;
  state: string = 'case1';
}

function createTestComponent(
  template: string,
  imports?: Type<any>[],
): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {
    set: {
      template: template,
      imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, ...(imports ?? [])],
    },
  }).createComponent(TestComponent);
}
