/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy} from '@angular/compiler';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NgStyle} from '../../index';

describe('NgStyle', () => {
  let fixture: ComponentFixture<TestComponent>;

  const supportsCssVariables =
    typeof getComputedStyle !== 'undefined' &&
    typeof CSS !== 'undefined' &&
    typeof CSS.supports !== 'undefined' &&
    CSS.supports('color', 'var(--fake-var)');

  function getComponent(): TestComponent {
    return fixture.componentInstance;
  }

  function expectNativeEl(fixture: ComponentFixture<any>): any {
    return expect(fixture.debugElement.children[0].nativeElement);
  }

  afterEach(() => {
    fixture = null!;
  });

  it('should add styles specified in an object literal', async () => {
    const template = `<div [ngStyle]="{'max-width': '40px'}"></div>`;
    fixture = createTestComponent(template);
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});
  });

  it('should add and change styles specified in an object expression', async () => {
    const template = `<div [ngStyle]="expr"></div>`;
    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    let expr = getComponent().expr;
    expr['max-width'] = '30%';
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '30%'});
  });

  it('should remove styles with a null expression', async () => {
    const template = `<div [ngStyle]="expr"></div>`;
    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    getComponent().expr = null;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
  });

  it('should remove styles with an undefined expression', async () => {
    const template = `<div [ngStyle]="expr"></div>`;
    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    getComponent().expr = undefined;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
  });

  it('should add and remove styles specified using style.unit notation', async () => {
    const template = `<div [ngStyle]="{'max-width.px': expr}"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = '40';
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    getComponent().expr = null;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
  });

  // https://github.com/angular/angular/issues/21064
  it('should add and remove styles which names are not dash-cased', async () => {
    fixture = createTestComponent(`<div [ngStyle]="{'color': expr}"></div>`);

    getComponent().expr = 'green';
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'color': 'green'});

    getComponent().expr = null;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).not.toHaveCssStyle('color');
  });

  it('should update styles using style.unit notation when unit changes', async () => {
    const template = `<div [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {'max-width.px': '40'};
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    getComponent().expr = {'max-width.em': '40'};
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40em'});
  });

  // keyValueDiffer is sensitive to key order #9115
  it('should change styles specified in an object expression', async () => {
    const template = `<div [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {
      // height, width order is important here
      height: '10px',
      width: '10px',
    };
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'height': '10px', 'width': '10px'});

    getComponent().expr = {
      // width, height order is important here
      width: '5px',
      height: '5px',
    };

    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'height': '5px', 'width': '5px'});
  });

  it('should remove styles when deleting a key in an object expression', async () => {
    const template = `<div [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    delete getComponent().expr['max-width'];
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
  });

  it('should co-operate with the style attribute', async () => {
    const template = `<div style="font-size: 12px" [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px', 'font-size': '12px'});

    delete getComponent().expr['max-width'];
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
    expectNativeEl(fixture).toHaveCssStyle({'font-size': '12px'});
  });

  it('should co-operate with the style.[styleName]="expr" special-case in the compiler', async () => {
    const template = `<div [style.font-size.px]="12" [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px', 'font-size': '12px'});

    delete getComponent().expr['max-width'];
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
    expectNativeEl(fixture).toHaveCssStyle({'font-size': '12px'});
  });

  it('should not write to the native node unless the bound expression has changed', async () => {
    const template = `<div [ngStyle]="{'color': expr}"></div>`;

    fixture = createTestComponent(template);
    fixture.componentInstance.expr = 'red';
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'color': 'red'});

    // Overwrite native styles so that we can check if ngStyle has performed DOM manupulation to
    // update it.
    fixture.debugElement.children[0].nativeElement.style.color = 'blue';
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    // Assert that the style hasn't been updated
    expectNativeEl(fixture).toHaveCssStyle({'color': 'blue'});

    fixture.componentInstance.expr = 'yellow';
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    // Assert that the style has changed now that the model has changed
    expectNativeEl(fixture).toHaveCssStyle({'color': 'yellow'});
  });

  it('should correctly update style with units (.px) when the model is set to number', async () => {
    const template = `<div [ngStyle]="{'width.px': expr}"></div>`;
    fixture = createTestComponent(template);
    fixture.componentInstance.expr = 400;
    await fixture.whenStable();
    expectNativeEl(fixture).toHaveCssStyle({'width': '400px'});
  });

  it('should handle CSS variables', async () => {
    if (!supportsCssVariables) {
      return;
    }

    const template = `<div style="width: var(--width)" [ngStyle]="{'--width': expr}"></div>`;
    fixture = createTestComponent(template);
    fixture.componentInstance.expr = '100px';
    await fixture.whenStable();

    const target: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(getComputedStyle(target).getPropertyValue('width')).toEqual('100px');
  });

  it('should be available as a standalone directive', async () => {
    @Component({
      selector: 'test-component',
      imports: [NgStyle],
      template: `<div [ngStyle]="{'width.px': expr}"></div>`,
      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestComponent {
      expr = 400;
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expectNativeEl(fixture).toHaveCssStyle({'width': '400px'});
  });
});

@Component({
  selector: 'test-cmp',
  template: '',
  imports: [NgStyle],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestComponent {
  expr: any;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}}).createComponent(
    TestComponent,
  );
}
