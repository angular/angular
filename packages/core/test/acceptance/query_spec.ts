/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild, ContentChildren, ElementRef, QueryList, TemplateRef, Type, ViewChild, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';


describe('query logic', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [AppComp, QueryComp, SimpleCompA, SimpleCompB]});
  });

  it('should return Component instances when Components are labelled and retrieved via View query',
     () => {
       const template = `
         <div><simple-comp-a #viewQuery></simple-comp-a></div>
         <div><simple-comp-b #viewQuery></simple-comp-b></div>
       `;
       const fixture = initWithTemplate(QueryComp, template);
       const comp = fixture.componentInstance;
       expect(comp.viewChild).toBeAnInstanceOf(SimpleCompA);
       expect(comp.viewChildren.first).toBeAnInstanceOf(SimpleCompA);
       expect(comp.viewChildren.last).toBeAnInstanceOf(SimpleCompB);
     });

  it('should return Component instance when Component is labelled and retrieved via Content query',
     () => {
       const template = `
         <local-ref-query-component #q>
           <simple-comp-a #contentQuery></simple-comp-a>
         </local-ref-query-component>
       `;
       const fixture = initWithTemplate(AppComp, template);
       const comp = fixture.debugElement.children[0].references['q'];
       expect(comp.contentChild).toBeAnInstanceOf(SimpleCompA);
       expect(comp.contentChildren.first).toBeAnInstanceOf(SimpleCompA);
     });

  onlyInIvy('multiple local refs are supported in Ivy')
      .it('should return Component instances when Components are labelled and retrieved via Content query',
          () => {
            const template = `
              <local-ref-query-component #q>
                <simple-comp-a #contentQuery></simple-comp-a>
                <simple-comp-b #contentQuery></simple-comp-b>
              </local-ref-query-component>
            `;
            const fixture = initWithTemplate(AppComp, template);
            const comp = fixture.debugElement.children[0].references['q'];
            expect(comp.contentChild).toBeAnInstanceOf(SimpleCompA);
            expect(comp.contentChildren.first).toBeAnInstanceOf(SimpleCompA);
            expect(comp.contentChildren.last).toBeAnInstanceOf(SimpleCompB);
            expect(comp.contentChildren.length).toBe(2);
          });

  it('should return ElementRef when HTML element is labelled and retrieved via View query', () => {
    const template = `
      <div #viewQuery></div>
    `;
    const fixture = initWithTemplate(QueryComp, template);
    const comp = fixture.componentInstance;
    expect(comp.viewChild).toBeAnInstanceOf(ElementRef);
    expect(comp.viewChildren.first).toBeAnInstanceOf(ElementRef);
  });

  onlyInIvy('multiple local refs are supported in Ivy')
      .it('should return ElementRefs when HTML elements are labelled and retrieved via View query',
          () => {
            const template = `
              <div #viewQuery #first>A</div>
              <div #viewQuery #second>B</div>
            `;
            const fixture = initWithTemplate(QueryComp, template);
            const comp = fixture.componentInstance;

            expect(comp.viewChild).toBeAnInstanceOf(ElementRef);
            expect(comp.viewChild.nativeElement)
                .toBe(fixture.debugElement.children[0].nativeElement);

            expect(comp.viewChildren.first).toBeAnInstanceOf(ElementRef);
            expect(comp.viewChildren.last).toBeAnInstanceOf(ElementRef);
            expect(comp.viewChildren.length).toBe(2);
          });

  it('should return TemplateRef when template is labelled and retrieved via View query', () => {
    const template = `
      <ng-template #viewQuery></ng-template>
    `;
    const fixture = initWithTemplate(QueryComp, template);
    const comp = fixture.componentInstance;
    expect(comp.viewChildren.first).toBeAnInstanceOf(TemplateRef);
  });

  onlyInIvy('multiple local refs are supported in Ivy')
      .it('should return TemplateRefs when templates are labelled and retrieved via View query',
          () => {
            const template = `
              <ng-template #viewQuery></ng-template>
              <ng-template #viewQuery></ng-template>
            `;
            const fixture = initWithTemplate(QueryComp, template);
            const comp = fixture.componentInstance;
            expect(comp.viewChild).toBeAnInstanceOf(TemplateRef);
            expect(comp.viewChild.elementRef.nativeElement)
                .toBe(fixture.debugElement.childNodes[0].nativeNode);

            expect(comp.viewChildren.first).toBeAnInstanceOf(TemplateRef);
            expect(comp.viewChildren.last).toBeAnInstanceOf(TemplateRef);
            expect(comp.viewChildren.length).toBe(2);
          });

  it('should return ElementRef when HTML element is labelled and retrieved via Content query',
     () => {
       const template = `
         <local-ref-query-component #q>
           <div #contentQuery></div>
         </local-ref-query-component>
       `;
       const fixture = initWithTemplate(AppComp, template);
       const comp = fixture.debugElement.children[0].references['q'];
       expect(comp.contentChildren.first).toBeAnInstanceOf(ElementRef);
     });

  onlyInIvy('multiple local refs are supported in Ivy')
      .it('should return ElementRefs when HTML elements are labelled and retrieved via Content query',
          () => {
            const template = `
              <local-ref-query-component #q>
                <div #contentQuery></div>
                <div #contentQuery></div>
              </local-ref-query-component>
            `;
            const fixture = initWithTemplate(AppComp, template);
            const firstChild = fixture.debugElement.children[0];
            const comp = firstChild.references['q'];

            expect(comp.contentChild).toBeAnInstanceOf(ElementRef);
            expect(comp.contentChild.nativeElement).toBe(firstChild.children[0].nativeElement);

            expect(comp.contentChildren.first).toBeAnInstanceOf(ElementRef);
            expect(comp.contentChildren.last).toBeAnInstanceOf(ElementRef);
            expect(comp.contentChildren.length).toBe(2);
          });

  it('should return TemplateRef when template is labelled and retrieved via Content query', () => {
    const template = `
       <local-ref-query-component #q>
         <ng-template #contentQuery></ng-template>
       </local-ref-query-component>
     `;
    const fixture = initWithTemplate(AppComp, template);
    const comp = fixture.debugElement.children[0].references['q'];
    expect(comp.contentChildren.first).toBeAnInstanceOf(TemplateRef);
  });

  onlyInIvy('multiple local refs are supported in Ivy')
      .it('should return TemplateRefs when templates are labelled and retrieved via Content query',
          () => {
            const template = `
              <local-ref-query-component #q>
                <ng-template #contentQuery></ng-template>
                <ng-template #contentQuery></ng-template>
              </local-ref-query-component>
            `;
            const fixture = initWithTemplate(AppComp, template);
            const firstChild = fixture.debugElement.children[0];
            const comp = firstChild.references['q'];

            expect(comp.contentChild).toBeAnInstanceOf(TemplateRef);
            expect(comp.contentChild.elementRef.nativeElement)
                .toBe(firstChild.childNodes[0].nativeNode);

            expect(comp.contentChildren.first).toBeAnInstanceOf(TemplateRef);
            expect(comp.contentChildren.last).toBeAnInstanceOf(TemplateRef);
            expect(comp.contentChildren.length).toBe(2);
          });
});

function initWithTemplate(compType: Type<any>, template: string) {
  TestBed.overrideComponent(compType, {set: new Component({template})});
  const fixture = TestBed.createComponent(compType);
  fixture.detectChanges();
  return fixture;
}

@Component({selector: 'local-ref-query-component', template: '<ng-content></ng-content>'})
class QueryComp {
  @ViewChild('viewQuery') viewChild !: any;
  @ContentChild('contentQuery') contentChild !: any;

  @ViewChildren('viewQuery') viewChildren !: QueryList<any>;
  @ContentChildren('contentQuery') contentChildren !: QueryList<any>;
}

@Component({selector: 'app-comp', template: ``})
class AppComp {
}

@Component({selector: 'simple-comp-a', template: ''})
class SimpleCompA {
}

@Component({selector: 'simple-comp-b', template: ''})
class SimpleCompB {
}