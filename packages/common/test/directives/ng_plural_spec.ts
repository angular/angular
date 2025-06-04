/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, NgLocalization, NgPlural, NgPluralCase} from '../../index';
import {Component, Injectable} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';

describe('ngPlural', () => {
  let fixture: ComponentFixture<any>;

  function getComponent(): TestComponent {
    return fixture.componentInstance;
  }

  function detectChangesAndExpectText<T>(text: string): void {
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText(text);
  }

  afterEach(() => {
    fixture = null!;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      providers: [{provide: NgLocalization, useClass: TestLocalization}],
      imports: [CommonModule],
    });
  });

  it('should display the template according to the exact value', waitForAsync(() => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="=0"><li>you have no messages.</li></ng-template>' +
      '<ng-template ngPluralCase="=1"><li>you have one message.</li></ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 0;
    detectChangesAndExpectText('you have no messages.');

    getComponent().switchValue = 1;
    detectChangesAndExpectText('you have one message.');
  }));

  it('should display the template according to the exact numeric value', waitForAsync(() => {
    const template =
      '<div>' +
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="0"><li>you have no messages.</li></ng-template>' +
      '<ng-template ngPluralCase="1"><li>you have one message.</li></ng-template>' +
      '</ul></div>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 0;
    detectChangesAndExpectText('you have no messages.');

    getComponent().switchValue = 1;
    detectChangesAndExpectText('you have one message.');
  }));

  // https://github.com/angular/angular/issues/9868
  // https://github.com/angular/angular/issues/9882
  it('should not throw when ngPluralCase contains expressions', waitForAsync(() => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="=0"><li>{{ switchValue }}</li></ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 0;
    expect(() => fixture.detectChanges()).not.toThrow();
  }));

  it('should be applicable to <ng-container> elements', waitForAsync(() => {
    const template =
      '<ng-container [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="=0">you have no messages.</ng-template>' +
      '<ng-template ngPluralCase="=1">you have one message.</ng-template>' +
      '</ng-container>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 0;
    detectChangesAndExpectText('you have no messages.');

    getComponent().switchValue = 1;
    detectChangesAndExpectText('you have one message.');
  }));

  it('should display the template according to the category', waitForAsync(() => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="few"><li>you have a few messages.</li></ng-template>' +
      '<ng-template ngPluralCase="many"><li>you have many messages.</li></ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 2;
    detectChangesAndExpectText('you have a few messages.');

    getComponent().switchValue = 8;
    detectChangesAndExpectText('you have many messages.');
  }));

  it('should default to other when no matches are found', waitForAsync(() => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="few"><li>you have a few messages.</li></ng-template>' +
      '<ng-template ngPluralCase="other"><li>default message.</li></ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 100;
    detectChangesAndExpectText('default message.');
  }));

  it('should prioritize value matches over category matches', waitForAsync(() => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="few"><li>you have a few messages.</li></ng-template>' +
      '<ng-template ngPluralCase="=2">you have two messages.</ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 2;
    detectChangesAndExpectText('you have two messages.');

    getComponent().switchValue = 3;
    detectChangesAndExpectText('you have a few messages.');
  }));
});

it('should be available as a standalone directive', () => {
  @Component({
    selector: 'test-component',
    imports: [NgPlural, NgPluralCase],
    template:
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="=0"><li>no messages</li></ng-template>' +
      '<ng-template ngPluralCase="=1"><li>one message</li></ng-template>' +
      '</ul>',
  })
  class TestComponent {
    switchValue = 1;
  }

  const fixture = TestBed.createComponent(TestComponent);
  fixture.detectChanges();

  expect(fixture.nativeElement.textContent).toBe('one message');
});

@Injectable()
class TestLocalization extends NgLocalization {
  override getPluralCategory(value: number): string {
    if (value > 1 && value < 4) {
      return 'few';
    }

    if (value >= 4 && value < 10) {
      return 'many';
    }

    return 'other';
  }
}

@Component({
  selector: 'test-cmp',
  template: '',
  standalone: false,
})
class TestComponent {
  switchValue: number | null = null;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}}).createComponent(
    TestComponent,
  );
}
