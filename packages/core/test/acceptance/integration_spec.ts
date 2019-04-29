/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, ContentChild, Directive, EventEmitter, HostBinding, HostListener, Input, Output, QueryList, TemplateRef, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('acceptance integration tests', () => {
  it('should only call inherited host listeners once', () => {
    let clicks = 0;

    @Component({template: ''})
    class ButtonSuperClass {
      @HostListener('click')
      clicked() { clicks++; }
    }

    @Component({selector: 'button[custom-button]', template: ''})
    class ButtonSubClass extends ButtonSuperClass {
    }

    @Component({template: '<button custom-button></button>'})
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp, ButtonSuperClass, ButtonSubClass]});
    const fixture = TestBed.createComponent(MyApp);
    const button = fixture.debugElement.query(By.directive(ButtonSubClass));
    fixture.detectChanges();

    button.nativeElement.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should support inherited view queries', () => {
    @Directive({selector: '[someDir]'})
    class SomeDir {
    }

    @Component({template: '<div someDir></div>'})
    class SuperComp {
      @ViewChildren(SomeDir) dirs !: QueryList<SomeDir>;
    }

    @Component({selector: 'button[custom-button]', template: '<div someDir></div>'})
    class SubComp extends SuperComp {
    }

    @Component({template: '<button custom-button></button>'})
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp, SuperComp, SubComp, SomeDir]});
    const fixture = TestBed.createComponent(MyApp);
    const subInstance = fixture.debugElement.query(By.directive(SubComp)).componentInstance;
    fixture.detectChanges();

    expect(subInstance.dirs.length).toBe(1);
    expect(subInstance.dirs.first).toBeAnInstanceOf(SomeDir);
  });

  it('should not set inputs after destroy', () => {
    @Directive({
      selector: '[no-assign-after-destroy]',
    })
    class NoAssignAfterDestroy {
      private _isDestroyed = false;

      @Input()
      get value() { return this._value; }
      set value(newValue: any) {
        if (this._isDestroyed) {
          throw Error('Cannot assign to value after destroy.');
        }

        this._value = newValue;
      }
      private _value: any;

      ngOnDestroy() { this._isDestroyed = true; }
    }

    @Component({template: '<div no-assign-after-destroy [value]="directiveValue"></div>'})
    class App {
      directiveValue = 'initial-value';
    }

    TestBed.configureTestingModule({declarations: [NoAssignAfterDestroy, App]});
    let fixture = TestBed.createComponent(App);
    fixture.destroy();

    expect(() => {
      fixture = TestBed.createComponent(App);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should support host attribute and @ContentChild on the same component', () => {
    @Component(
        {selector: 'test-component', template: `foo`, host: {'[attr.aria-disabled]': 'true'}})
    class TestComponent {
      @ContentChild(TemplateRef) tpl !: TemplateRef<any>;
    }

    TestBed.configureTestingModule({declarations: [TestComponent]});
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.tpl).not.toBeNull();
    expect(fixture.debugElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('should inherit inputs from undecorated superclasses', () => {
    class ButtonSuperClass {
      @Input() isDisabled !: boolean;
    }

    @Component({selector: 'button[custom-button]', template: ''})
    class ButtonSubClass extends ButtonSuperClass {
    }

    @Component({template: '<button custom-button [isDisabled]="disableButton"></button>'})
    class MyApp {
      disableButton = false;
    }

    TestBed.configureTestingModule({declarations: [MyApp, ButtonSubClass]});
    const fixture = TestBed.createComponent(MyApp);
    const button = fixture.debugElement.query(By.directive(ButtonSubClass)).componentInstance;
    fixture.detectChanges();

    expect(button.isDisabled).toBe(false);

    fixture.componentInstance.disableButton = true;
    fixture.detectChanges();

    expect(button.isDisabled).toBe(true);
  });

  it('should inherit outputs from undecorated superclasses', () => {
    let clicks = 0;

    class ButtonSuperClass {
      @Output() clicked = new EventEmitter<void>();
      emitClick() { this.clicked.emit(); }
    }

    @Component({selector: 'button[custom-button]', template: ''})
    class ButtonSubClass extends ButtonSuperClass {
    }

    @Component({template: '<button custom-button (clicked)="handleClick()"></button>'})
    class MyApp {
      handleClick() { clicks++; }
    }

    TestBed.configureTestingModule({declarations: [MyApp, ButtonSubClass]});
    const fixture = TestBed.createComponent(MyApp);
    const button = fixture.debugElement.query(By.directive(ButtonSubClass)).componentInstance;

    button.emitClick();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should inherit host bindings from undecorated superclasses', () => {
    class BaseButton {
      @HostBinding('attr.tabindex')
      tabindex = -1;
    }

    @Component({selector: '[sub-button]', template: '<ng-content></ng-content>'})
    class SubButton extends BaseButton {
    }

    @Component({template: '<button sub-button>Click me</button>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [SubButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton));
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('tabindex')).toBe('-1');

    button.componentInstance.tabindex = 2;
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('tabindex')).toBe('2');
  });

  it('should inherit host bindings from undecorated grand superclasses', () => {
    class SuperBaseButton {
      @HostBinding('attr.tabindex')
      tabindex = -1;
    }

    class BaseButton extends SuperBaseButton {}

    @Component({selector: '[sub-button]', template: '<ng-content></ng-content>'})
    class SubButton extends BaseButton {
    }

    @Component({template: '<button sub-button>Click me</button>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [SubButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton));
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('tabindex')).toBe('-1');

    button.componentInstance.tabindex = 2;
    fixture.detectChanges();

    expect(button.nativeElement.getAttribute('tabindex')).toBe('2');
  });

  it('should inherit host listeners from undecorated superclasses', () => {
    let clicks = 0;

    class BaseButton {
      @HostListener('click')
      handleClick() { clicks++; }
    }

    @Component({selector: '[sub-button]', template: '<ng-content></ng-content>'})
    class SubButton extends BaseButton {
    }

    @Component({template: '<button sub-button>Click me</button>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [SubButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton)).nativeElement;

    button.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should inherit host listeners from superclasses once', () => {
    let clicks = 0;

    @Directive({selector: '[baseButton]'})
    class BaseButton {
      @HostListener('click')
      handleClick() { clicks++; }
    }

    @Component({selector: '[subButton]', template: '<ng-content></ng-content>'})
    class SubButton extends BaseButton {
    }

    @Component({template: '<button subButton>Click me</button>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [SubButton, BaseButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton)).nativeElement;

    button.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should inherit host listeners from grand superclasses once', () => {
    let clicks = 0;

    @Directive({selector: '[superBaseButton]'})
    class SuperBaseButton {
      @HostListener('click')
      handleClick() { clicks++; }
    }

    @Directive({selector: '[baseButton]'})
    class BaseButton extends SuperBaseButton {
    }

    @Component({selector: '[subButton]', template: '<ng-content></ng-content>'})
    class SubButton extends BaseButton {
    }

    @Component({template: '<button subButton>Click me</button>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [SubButton, SuperBaseButton, BaseButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton)).nativeElement;

    button.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should inherit host listeners from grand grand superclasses once', () => {
    let clicks = 0;

    @Directive({selector: '[superSuperBaseButton]'})
    class SuperSuperBaseButton {
      @HostListener('click')
      handleClick() { clicks++; }
    }

    @Directive({selector: '[superBaseButton]'})
    class SuperBaseButton extends SuperSuperBaseButton {
    }

    @Directive({selector: '[baseButton]'})
    class BaseButton extends SuperBaseButton {
    }

    @Component({selector: '[subButton]', template: '<ng-content></ng-content>'})
    class SubButton extends BaseButton {
    }

    @Component({template: '<button subButton>Click me</button>'})
    class App {
    }

    TestBed.configureTestingModule(
        {declarations: [SubButton, SuperBaseButton, SuperSuperBaseButton, BaseButton, App]});
    const fixture = TestBed.createComponent(App);
    const button = fixture.debugElement.query(By.directive(SubButton)).nativeElement;

    button.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

});
