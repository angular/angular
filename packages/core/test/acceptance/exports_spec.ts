/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, DoCheck, Input, OnChanges, OnInit, SimpleChanges, Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {modifiedInIvy, onlyInIvy} from '@angular/private/testing';

describe('exports', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComp, ComponentToReference, DirToReference, DirToReferenceWithPreOrderHooks,
        DirWithCompInput
      ]
    });
  });

  it('should support export of DOM element', () => {
    const fixture = initWithTemplate(AppComp, '<input value="one" #myInput> {{ myInput.value }}');
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toEqual('<input value="one"> one');
  });

  it('should support basic export of component', () => {
    const fixture =
        initWithTemplate(AppComp, '<comp-to-ref #myComp></comp-to-ref> {{ myComp.name }}');
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual('<comp-to-ref></comp-to-ref> Nancy');
  });

  it('should work with directives with exportAs set', () => {
    const fixture = initWithTemplate(AppComp, '<div dir #myDir="dir"></div> {{ myDir.name }}');
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual('<div dir=""></div> Drew');
  });

  describe('input changes in hooks', () => {
    it('should support forward reference', () => {
      const fixture = initWithTemplate(
          AppComp, '<div dir-on-change #myDir="dirOnChange" [in]="true"></div> {{ myDir.name }}');
      fixture.detectChanges();
      expect(fixture.nativeElement.firstChild.title).toBe('Drew!?@');            // div element
      expect(fixture.nativeElement.lastChild.textContent).toContain('Drew!?@');  // text node
    });

    modifiedInIvy('Supporting input changes in hooks is limited in Ivy')
        .it('should support backward reference', () => {
          const fixture = initWithTemplate(
              AppComp,
              '{{ myDir.name }} <div dir-on-change #myDir="dirOnChange" [in]="true"></div>');
          fixture.detectChanges();
          expect(fixture.nativeElement.firstChild.textContent).toContain('Drew!?@');  // text node
          expect(fixture.nativeElement.lastChild.title).toBe('Drew!?@');              // div element
        });

    onlyInIvy('Supporting input changes in hooks is limited in Ivy')
        .it('should not support backward reference', () => {
          expect(() => {
            const fixture = initWithTemplate(
                AppComp,
                '{{ myDir.name }} <div dir-on-change #myDir="dirOnChange" [in]="true"></div>');
            fixture.detectChanges();
          })
              .toThrowError(
                  /ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked/);
        });

    modifiedInIvy('Supporting input changes in hooks is limited in Ivy')
        .it('should support reference on the same node', () => {
          const fixture = initWithTemplate(
              AppComp,
              '<div dir-on-change #myDir="dirOnChange" [in]="true" [id]="myDir.name"></div>');
          fixture.detectChanges();
          expect(fixture.nativeElement.firstChild.id).toBe('Drew!?@');
          expect(fixture.nativeElement.firstChild.title).toBe('Drew!?@');
        });

    onlyInIvy('Supporting input changes in hooks is limited in Ivy')
        .it('should not support reference on the same node', () => {
          expect(() => {
            const fixture = initWithTemplate(
                AppComp,
                '<div dir-on-change #myDir="dirOnChange" [in]="true" [id]="myDir.name"></div>');
            fixture.detectChanges();
          })
              .toThrowError(
                  /ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked/);
        });

    it('should support input referenced by host binding on that directive', () => {
      const fixture =
          initWithTemplate(AppComp, '<div dir-on-change #myDir="dirOnChange" [in]="true"></div>');
      fixture.detectChanges();
      expect(fixture.nativeElement.firstChild.title).toBe('Drew!?@');
    });
  });

  onlyInIvy('Different error message is thrown in View Engine')
      .it('should throw if export name is not found', () => {
        expect(() => {
          const fixture = initWithTemplate(AppComp, '<div #myDir="dir"></div>');
          fixture.detectChanges();
        }).toThrowError(/Export of name 'dir' not found!/);
      });

  it('should support component instance fed into directive', () => {
    const fixture = initWithTemplate(
        AppComp, '<comp-to-ref #myComp></comp-to-ref> <div [dirWithInput]="myComp"></div>');
    fixture.detectChanges();

    const myComp = fixture.debugElement.children[0].injector.get(ComponentToReference);
    const dirWithInput = fixture.debugElement.children[1].injector.get(DirWithCompInput);

    expect(dirWithInput.comp).toEqual(myComp);
  });


  onlyInIvy(
      'in Ivy first declared ref is selected in case of multiple non-unique refs, when VE used the last one')
      .it('should point to the first declared ref', () => {
        const fixture = initWithTemplate(AppComp, `
          <div>
            <input value="First" #ref />
            <input value="Second" #ref />
            <input value="Third" #ref />
            <span>{{ ref.value }}</span>
          </div>
        `);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('span').innerHTML).toBe('First');
      });
});

function initWithTemplate(compType: Type<any>, template: string) {
  TestBed.overrideComponent(compType, {set: new Component({template})});
  return TestBed.createComponent(compType);
}

@Component({selector: 'comp-to-ref', template: ''})
class ComponentToReference {
  name = 'Nancy';
}

@Component({selector: 'app-comp', template: ``})
class AppComp {
}

@Directive({selector: '[dir]', exportAs: 'dir'})
class DirToReference {
  name = 'Drew';
}

@Directive({selector: '[dirWithInput]'})
class DirWithCompInput {
  @Input('dirWithInput') comp: ComponentToReference|null = null;
}

@Directive({selector: '[dir-on-change]', exportAs: 'dirOnChange', host: {'[title]': 'name'}})
class DirToReferenceWithPreOrderHooks implements OnInit, OnChanges, DoCheck {
  @Input() in : any = null;
  name = 'Drew';
  ngOnChanges(changes: SimpleChanges) { this.name += '!'; }
  ngOnInit() { this.name += '?'; }
  ngDoCheck() { this.name += '@'; }
}
