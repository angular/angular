/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, DoCheck, Input, OnChanges, OnInit, SimpleChanges, Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';

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

    it('should not support backward reference', () => {
      expect(() => {
        const fixture = initWithTemplate(
            AppComp, '{{ myDir.name }} <div dir-on-change #myDir="dirOnChange" [in]="true"></div>');
        fixture.detectChanges();
      })
          .toThrowError(
              /ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked/);
    });

    it('should not support reference on the same node', () => {
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

  it('should throw if export name is not found', () => {
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

  it('should point to the first declared ref', () => {
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

  describe('forward refs', () => {
    it('should work with basic text bindings', () => {
      const fixture = initWithTemplate(AppComp, '{{ myInput.value}} <input value="one" #myInput>');
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('one <input value="one">');
    });

    it('should work with element properties', () => {
      const fixture = initWithTemplate(
          AppComp, '<div [title]="myInput.value"></div> <input value="one" #myInput>');
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('<div title="one"></div><input value="one">');
    });

    it('should work with element attrs', () => {
      const fixture = initWithTemplate(
          AppComp, '<div [attr.aria-label]="myInput.value"></div> <input value="one" #myInput>');
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML)
          .toEqual('<div aria-label="one"></div><input value="one">');
    });

    it('should work with element classes', () => {
      const fixture = initWithTemplate(
          AppComp,
          '<div [class.red]="myInput.checked"></div> <input type="checkbox" checked #myInput>');
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toContain('<div class="red"></div>');
    });

    it('should work with component refs', () => {
      const fixture = initWithTemplate(
          AppComp, '<div [dirWithInput]="myComp"></div><comp-to-ref #myComp></comp-to-ref>');
      fixture.detectChanges();

      const dirWithInput = fixture.debugElement.children[0].injector.get(DirWithCompInput);
      const myComp = fixture.debugElement.children[1].injector.get(ComponentToReference);

      expect(dirWithInput.comp).toEqual(myComp);
    });

    it('should work with multiple forward refs', () => {
      const fixture = initWithTemplate(
          AppComp,
          '{{ myInput.value }} {{ myComp.name }} <comp-to-ref #myComp></comp-to-ref> <input value="one" #myInput>');
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML)
          .toEqual('one Nancy <comp-to-ref></comp-to-ref><input value="one">');
    });

    it('should support local refs in nested dynamic views', () => {
      const fixture = initWithTemplate(AppComp, `
        <input value="one" #outerInput>
        <div *ngIf="outer">
          {{ outerInput.value }}
            <input value = "two" #innerInput>
            <div *ngIf="inner">
                {{ outerInput.value }} - {{ innerInput.value}}
            </div>
        </div>
      `);
      fixture.detectChanges();
      fixture.componentInstance.outer = true;
      fixture.componentInstance.inner = true;
      fixture.detectChanges();

      // result should be <input value="one"><div>one <input value="two"><div>one - two</div></div>
      // but contains bindings comments for ngIf
      // so we check the outer div
      expect(fixture.nativeElement.innerHTML).toContain('one <input value="two">');
      // and the inner div
      expect(fixture.nativeElement.innerHTML).toContain('one - two');
    });
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
  outer = false;
  inner = false;
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
  ngOnChanges(changes: SimpleChanges) {
    this.name += '!';
  }
  ngOnInit() {
    this.name += '?';
  }
  ngDoCheck() {
    this.name += '@';
  }
}
