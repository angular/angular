/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy} from '@angular/compiler';
import {Component, Injectable} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {NgLocalization, NgPlural, NgPluralCase} from '../../index';

describe('ngPlural', () => {
  let fixture: ComponentFixture<any>;

  function getComponent(): TestComponent {
    return fixture.componentInstance;
  }

  async function waitForStableAndExpectText(text: string): Promise<void> {
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText(text);
  }

  afterEach(() => {
    fixture = null!;
  });

  it('should display the template according to the exact value', async () => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="=0"><li>you have no messages.</li></ng-template>' +
      '<ng-template ngPluralCase="=1"><li>you have one message.</li></ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 0;
    await waitForStableAndExpectText('you have no messages.');

    getComponent().switchValue = 1;
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('you have one message.');
  });

  it('should display the template according to the exact numeric value', async () => {
    const template =
      '<div>' +
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="0"><li>you have no messages.</li></ng-template>' +
      '<ng-template ngPluralCase="1"><li>you have one message.</li></ng-template>' +
      '</ul></div>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 0;
    await waitForStableAndExpectText('you have no messages.');

    getComponent().switchValue = 1;
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('you have one message.');
  });

  // https://github.com/angular/angular/issues/9868
  // https://github.com/angular/angular/issues/9882
  it('should not throw when ngPluralCase contains expressions', async () => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="=0"><li>{{ switchValue }}</li></ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 0;
    await expectAsync(fixture.whenStable()).toBeResolved();
  });

  it('should be applicable to <ng-container> elements', async () => {
    const template =
      '<ng-container [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="=0">you have no messages.</ng-template>' +
      '<ng-template ngPluralCase="=1">you have one message.</ng-template>' +
      '</ng-container>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 0;
    await waitForStableAndExpectText('you have no messages.');

    getComponent().switchValue = 1;
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('you have one message.');
  });

  it('should display the template according to the category', async () => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="few"><li>you have a few messages.</li></ng-template>' +
      '<ng-template ngPluralCase="many"><li>you have many messages.</li></ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 2;
    await waitForStableAndExpectText('you have a few messages.');

    getComponent().switchValue = 8;
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('you have many messages.');
  });

  it('should default to other when no matches are found', async () => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="few"><li>you have a few messages.</li></ng-template>' +
      '<ng-template ngPluralCase="other"><li>default message.</li></ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 100;
    await waitForStableAndExpectText('default message.');
  });

  it('should prioritize value matches over category matches', async () => {
    const template =
      '<ul [ngPlural]="switchValue">' +
      '<ng-template ngPluralCase="few"><li>you have a few messages.</li></ng-template>' +
      '<ng-template ngPluralCase="=2">you have two messages.</ng-template>' +
      '</ul>';

    fixture = createTestComponent(template);

    getComponent().switchValue = 2;
    await waitForStableAndExpectText('you have two messages.');

    getComponent().switchValue = 3;
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('you have a few messages.');
  });

  it('should be available as a standalone directive', async () => {
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
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('one message');
  });
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
  imports: [NgPlural, NgPluralCase],
  providers: [{provide: NgLocalization, useClass: TestLocalization}],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestComponent {
  switchValue: number | null = null;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}}).createComponent(
    TestComponent,
  );
}
