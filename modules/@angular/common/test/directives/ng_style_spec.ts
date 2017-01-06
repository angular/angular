/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';

export function main() {
  describe('NgStyle', () => {
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent { return fixture.componentInstance; }

    function expectNativeEl(fixture: ComponentFixture<any>): any {
      return expect(fixture.debugElement.children[0].nativeElement);
    }

    afterEach(() => { fixture = null; });

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComponent], imports: [CommonModule]});
    });

    it('should add styles specified in an object literal', async(() => {
         const template = `<div [ngStyle]="{'max-width': '40px'}"></div>`;
         fixture = createTestComponent(template);

         fixture.detectChanges();
         expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});
       }));

    it('should add and change styles specified in an object expression', async(() => {
         const template = `<div [ngStyle]="expr"></div>`;

         fixture = createTestComponent(template);
         let expr: {[k: string]: string};

         getComponent().expr = {'max-width': '40px'};
         fixture.detectChanges();
         expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

         expr = getComponent().expr;
         expr['max-width'] = '30%';
         fixture.detectChanges();
         expectNativeEl(fixture).toHaveCssStyle({'max-width': '30%'});
       }));

    it('should add and remove styles specified using style.unit notation', async(() => {
         const template = `<div [ngStyle]="{'max-width.px': expr}"></div>`;

         fixture = createTestComponent(template);

         getComponent().expr = '40';
         fixture.detectChanges();
         expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

         getComponent().expr = null;
         fixture.detectChanges();
         expectNativeEl(fixture).not.toHaveCssStyle('max-width');
       }));

    it('should update styles using style.unit notation when unit changes', async(() => {
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
    it('should change styles specified in an object expression', async(() => {
         const template = `<div [ngStyle]="expr"></div>`;

         fixture = createTestComponent(template);

         getComponent().expr = {
           // height, width order is important here
           height: '10px',
           width: '10px'
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

    it('should remove styles when deleting a key in an object expression', async(() => {
         const template = `<div [ngStyle]="expr"></div>`;

         fixture = createTestComponent(template);

         getComponent().expr = {'max-width': '40px'};
         fixture.detectChanges();
         expectNativeEl(fixture).toHaveCssStyle({'max-width': '40px'});

         delete getComponent().expr['max-width'];
         fixture.detectChanges();
         expectNativeEl(fixture).not.toHaveCssStyle('max-width');
       }));

    it('should co-operate with the style attribute', async(() => {
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

    it('should co-operate with the style.[styleName]="expr" special-case in the compiler',
       async(() => {
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
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  expr: any;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
