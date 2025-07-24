/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, NgStyle} from '../../index';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

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

  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [TestComponent], imports: [CommonModule]});
  });

  it('should add styles specified in an object literal', waitForAsync(() => {
    const template = `<div [ngStyle]="{'max-width': '40px'}"></div>`;
    fixture = createTestComponent(template);
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});
  }));

  it('should add and change styles specified in an object expression', waitForAsync(() => {
    const template = `<div [ngStyle]="expr"></div>`;
    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    let expr = getComponent().expr;
    expr['max-width'] = '30%';
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '30%'});
  }));

  it('should remove styles with a null expression', waitForAsync(() => {
    const template = `<div [ngStyle]="expr"></div>`;
    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    getComponent().expr = null;
    fixture.detectChanges();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
  }));

  it('should remove styles with an undefined expression', waitForAsync(() => {
    const template = `<div [ngStyle]="expr"></div>`;
    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    getComponent().expr = undefined;
    fixture.detectChanges();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
  }));

  it('should add and remove styles specified using style.unit notation', waitForAsync(() => {
    const template = `<div [ngStyle]="{'max-width.px': expr}"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = '40';
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    getComponent().expr = null;
    fixture.detectChanges();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
  }));

  // https://github.com/angular/angular/issues/21064
  it('should add and remove styles which names are not dash-cased', waitForAsync(() => {
    fixture = createTestComponent(`<div [ngStyle]="{'color': expr}"></div>`);

    getComponent().expr = 'green';
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'color': 'green'});

    getComponent().expr = null;
    fixture.detectChanges();
    expectNativeEl(fixture).not.toHaveCssStyle('color');
  }));

  it('should update styles using style.unit notation when unit changes', waitForAsync(() => {
    const template = `<div [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {'max-width.px': '40'};
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    getComponent().expr = {'max-width.em': '40'};
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40em'});
  }));

  // keyValueDiffer is sensitive to key order #9115
  it('should change styles specified in an object expression', waitForAsync(() => {
    const template = `<div [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {
      // height, width order is important here
      height: '10px',
      width: '10px',
    };

    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'height': '10px', 'width': '10px'});

    getComponent().expr = {
      // width, height order is important here
      width: '5px',
      height: '5px',
    };

    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'height': '5px', 'width': '5px'});
  }));

  it('should remove styles when deleting a key in an object expression', waitForAsync(() => {
    const template = `<div [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

    delete getComponent().expr['max-width'];
    fixture.detectChanges();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
  }));

  it('should co-operate with the style attribute', waitForAsync(() => {
    const template = `<div style="font-size: 12px" [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px', 'font-size': '12px'});

    delete getComponent().expr['max-width'];
    fixture.detectChanges();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
    expectNativeEl(fixture).toHaveCssStyle({'font-size': '12px'});
  }));

  it('should co-operate with the style.[styleName]="expr" special-case in the compiler', waitForAsync(() => {
    const template = `<div [style.font-size.px]="12" [ngStyle]="expr"></div>`;

    fixture = createTestComponent(template);

    getComponent().expr = {'max-width': '40px'};
    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px', 'font-size': '12px'});

    delete getComponent().expr['max-width'];
    fixture.detectChanges();
    expectNativeEl(fixture).not.toHaveCssStyle('max-width');
    expectNativeEl(fixture).toHaveCssStyle({'font-size': '12px'});
  }));

  it('should not write to the native node unless the bound expression has changed', () => {
    const template = `<div [ngStyle]="{'color': expr}"></div>`;

    fixture = createTestComponent(template);
    fixture.componentInstance.expr = 'red';

    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'color': 'red'});

    // Overwrite native styles so that we can check if ngStyle has performed DOM manupulation to
    // update it.
    fixture.debugElement.children[0].nativeElement.style.color = 'blue';
    fixture.detectChanges();
    // Assert that the style hasn't been updated
    expectNativeEl(fixture).toHaveCssStyle({'color': 'blue'});

    fixture.componentInstance.expr = 'yellow';
    fixture.detectChanges();
    // Assert that the style has changed now that the model has changed
    expectNativeEl(fixture).toHaveCssStyle({'color': 'yellow'});
  });

  it('should correctly update style with units (.px) when the model is set to number', () => {
    const template = `<div [ngStyle]="{'width.px': expr}"></div>`;
    fixture = createTestComponent(template);
    fixture.componentInstance.expr = 400;

    fixture.detectChanges();
    expectNativeEl(fixture).toHaveCssStyle({'width': '400px'});
  });

  it('should handle CSS variables', () => {
    if (!supportsCssVariables) {
      return;
    }

    const template = `<div style="width: var(--width)" [ngStyle]="{'--width': expr}"></div>`;
    fixture = createTestComponent(template);
    fixture.componentInstance.expr = '100px';
    fixture.detectChanges();

    const target: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(getComputedStyle(target).getPropertyValue('width')).toEqual('100px');
  });

  it('should be available as a standalone directive', () => {
    @Component({
      selector: 'test-component',
      imports: [NgStyle],
      template: `<div [ngStyle]="{'width.px': expr}"></div>`,
    })
    class TestComponent {
      expr = 400;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expectNativeEl(fixture).toHaveCssStyle({'width': '400px'});
  });
});

@Component({
  selector: 'test-cmp',
  template: '',
  standalone: false,
})
class TestComponent {
  expr: any;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}}).createComponent(
    TestComponent,
  );
}
