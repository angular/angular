/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {state, style, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {Component, Directive, EventEmitter, Input, Output, ViewContainerRef} from '../../src/core';
import {TestBed} from '../../testing';
import {By, DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('property bindings', () => {
  it('should support bindings to properties', () => {
    @Component({
      template: `<span [id]="id"></span>`,
      standalone: false,
    })
    class Comp {
      id: string | undefined;
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    const spanEl = fixture.nativeElement.querySelector('span');

    expect(spanEl.id).toBeFalsy();

    fixture.componentInstance.id = 'testId';
    fixture.detectChanges();

    expect(spanEl.id).toBe('testId');
  });

  it('should update bindings when value changes', () => {
    @Component({
      template: `<a [title]="title"></a>`,
      standalone: false,
    })
    class Comp {
      title = 'Hello';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    let a = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(a.title).toBe('Hello');

    fixture.componentInstance.title = 'World';
    fixture.detectChanges();
    expect(a.title).toBe('World');
  });

  it('should not update bindings when value does not change', () => {
    @Component({
      template: `<a [title]="title"></a>`,
      standalone: false,
    })
    class Comp {
      title = 'Hello';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    let a = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(a.title).toBe('Hello');

    fixture.detectChanges();
    expect(a.title).toBe('Hello');
  });

  it('should bind to properties whose names do not correspond to their attribute names', () => {
    @Component({
      template: '<label [for]="forValue"></label>',
    })
    class MyComp {
      forValue?: string;
    }

    const fixture = TestBed.createComponent(MyComp);
    const labelNode = fixture.debugElement.query(By.css('label'));

    fixture.componentInstance.forValue = 'some-input';
    fixture.detectChanges();

    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-input');

    fixture.componentInstance.forValue = 'some-textarea';
    fixture.detectChanges();

    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-textarea');
  });

  it(
    'should not map properties whose names do not correspond to their attribute names, ' +
      'if they correspond to inputs',
    () => {
      @Component({
        template: '',
        selector: 'my-comp',
      })
      class MyComp {
        @Input() for!: string;
      }

      @Component({
        template: '<my-comp [for]="forValue"></my-comp>',
        imports: [MyComp],
      })
      class App {
        forValue?: string;
      }

      const fixture = TestBed.createComponent(App);
      const myCompNode = fixture.debugElement.query(By.directive(MyComp));
      fixture.componentInstance.forValue = 'hello';
      fixture.detectChanges();
      expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
      expect(myCompNode.componentInstance.for).toBe('hello');

      fixture.componentInstance.forValue = 'hej';
      fixture.detectChanges();
      expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
      expect(myCompNode.componentInstance.for).toBe('hej');
    },
  );

  it('should bind ARIA properties to their corresponding attributes', () => {
    @Component({
      template: '<button [ariaLabel]="label" [ariaHasPopup]="hasPopup"></button>',
    })
    class MyComp {
      label?: string;
      hasPopup?: string;
    }

    const fixture = TestBed.createComponent(MyComp);
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    fixture.componentInstance.label = 'Open';
    fixture.componentInstance.hasPopup = 'menu';
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Open');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');

    fixture.componentInstance.label = 'Close';
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Close');
  });

  it('should bind interpolated ARIA attributes', () => {
    @Component({
      template: '<button aria-label="{{label}} menu"></button>',
    })
    class MyComp {
      label?: string;
    }

    const fixture = TestBed.createComponent(MyComp);
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    fixture.componentInstance.label = 'Open';
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Open menu');

    fixture.componentInstance.label = 'Close';
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Close menu');
  });

  describe('should bind to ARIA attribute names', () => {
    it('on HTML elements', () => {
      @Component({
        template: '<button [aria-label]="label"></button>',
      })
      class MyComp {
        label?: string;
      }

      const fixture = TestBed.createComponent(MyComp);
      const button = fixture.debugElement.query(By.css('button')).nativeElement;

      fixture.componentInstance.label = 'Open';
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Open');

      fixture.componentInstance.label = 'Close';
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Close');
    });

    it('on component elements', () => {
      @Component({
        selector: 'button[fancy]',
      })
      class FancyButton {}

      @Component({
        template: '<button fancy [aria-label]="label"></button>',
        imports: [FancyButton],
      })
      class MyComp {
        label?: string;
      }

      const fixture = TestBed.createComponent(MyComp);
      const button = fixture.debugElement.query(By.css('button')).nativeElement;

      fixture.componentInstance.label = 'Open';
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Open');

      fixture.componentInstance.label = 'Close';
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Close');
    });
  });

  it('should no bind to ARIA properties if they correspond to inputs', () => {
    @Component({
      template: '',
      selector: 'my-comp',
    })
    class MyComp {
      @Input() ariaLabel?: string;
    }

    @Component({
      template: '<my-comp [ariaLabel]="label"></my-comp>',
      imports: [MyComp],
    })
    class App {
      label = 'a';
    }

    const fixture = TestBed.createComponent(App);
    const myCompNode = fixture.debugElement.query(By.directive(MyComp));

    fixture.componentInstance.label = 'a';
    fixture.detectChanges();

    expect(myCompNode.nativeElement.getAttribute('aria-label')).toBeFalsy();
    expect(myCompNode.componentInstance.ariaLabel).toBe('a');

    fixture.componentInstance.label = 'b';
    fixture.detectChanges();

    expect(myCompNode.nativeElement.getAttribute('aria-label')).toBeFalsy();
    expect(myCompNode.componentInstance.ariaLabel).toBe('b');
  });

  it(
    'should not bind to ARIA properties by their corresponding attribute names, if they ' +
      'correspond to inputs',
    () => {
      @Component({
        template: '',
        selector: 'my-comp',
      })
      class MyComp {
        @Input({alias: 'aria-label'}) myAriaLabel?: string;
      }

      @Component({
        template: '<my-comp [aria-label]="label"></my-comp>',
        imports: [MyComp],
      })
      class App {
        label = 'a';
      }

      const fixture = TestBed.createComponent(App);
      const myCompNode = fixture.debugElement.query(By.directive(MyComp));

      fixture.componentInstance.label = 'a';
      fixture.detectChanges();

      expect(myCompNode.nativeElement.getAttribute('aria-label')).toBeFalsy();
      expect(myCompNode.componentInstance.myAriaLabel).toBe('a');

      fixture.componentInstance.label = 'b';
      fixture.detectChanges();

      expect(myCompNode.nativeElement.getAttribute('aria-label')).toBeFalsy();
      expect(myCompNode.componentInstance.myAriaLabel).toBe('b');
    },
  );

  it('should use the sanitizer in bound properties', () => {
    @Component({
      template: `
        <a [href]="url">
      `,
      standalone: false,
    })
    class App {
      url: string | SafeUrl = 'javascript:alert("haha, I am taking over your computer!!!");';
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector('a');

    expect(a.href.indexOf('unsafe:')).toBe(0);

    const domSanitzer: DomSanitizer = TestBed.inject(DomSanitizer);
    fixture.componentInstance.url = domSanitzer.bypassSecurityTrustUrl(
      'javascript:alert("the developer wanted this");',
    );
    fixture.detectChanges();

    expect(a.href.indexOf('unsafe:')).toBe(-1);
  });

  it('should not stringify non-string values', () => {
    @Component({
      template: `<input [required]="isRequired"/>`,
      standalone: false,
    })
    class Comp {
      isRequired = false;
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('input')).nativeElement.required).toBe(false);
  });

  it('should support interpolation for properties', () => {
    @Component({
      template: `<span id="{{'_' + id + '_'}}"></span>`,
      standalone: false,
    })
    class Comp {
      id: string | undefined;
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    const spanEl = fixture.nativeElement.querySelector('span');

    fixture.componentInstance.id = 'testId';
    fixture.detectChanges();
    expect(spanEl.id).toBe('_testId_');

    fixture.componentInstance.id = 'otherId';
    fixture.detectChanges();
    expect(spanEl.id).toBe('_otherId_');
  });

  describe('input properties', () => {
    @Directive({
      selector: '[myButton]',
      standalone: false,
    })
    class MyButton {
      @Input() disabled: boolean | undefined;
    }

    @Directive({
      selector: '[otherDir]',
      standalone: false,
    })
    class OtherDir {
      @Input() id: number | undefined;
      @Output('click') clickStream = new EventEmitter<void>();
    }

    @Directive({
      selector: '[otherDisabledDir]',
      standalone: false,
    })
    class OtherDisabledDir {
      @Input() disabled: boolean | undefined;
    }

    @Directive({
      selector: '[idDir]',
      standalone: false,
    })
    class IdDir {
      @Input('id') idNumber: string | undefined;
    }

    it('should check input properties before setting (directives)', () => {
      @Component({
        template: `<button myButton otherDir [id]="id" [disabled]="isDisabled">Click me</button>`,
        standalone: false,
      })
      class App {
        id = 0;
        isDisabled = true;
      }

      TestBed.configureTestingModule({declarations: [App, MyButton, OtherDir]});
      const fixture = TestBed.createComponent(App);
      const button = fixture.debugElement.query(By.directive(MyButton)).injector.get(MyButton);
      const otherDir = fixture.debugElement.query(By.directive(OtherDir)).injector.get(OtherDir);
      const buttonEl = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(buttonEl.getAttribute('mybutton')).toBe('');
      expect(buttonEl.getAttribute('otherdir')).toBe('');
      expect(buttonEl.hasAttribute('id')).toBe(false);
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(true);
      expect(otherDir.id).toEqual(0);

      fixture.componentInstance.isDisabled = false;
      fixture.componentInstance.id = 1;
      fixture.detectChanges();

      expect(buttonEl.getAttribute('mybutton')).toBe('');
      expect(buttonEl.getAttribute('otherdir')).toBe('');
      expect(buttonEl.hasAttribute('id')).toBe(false);
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(false);
      expect(otherDir.id).toEqual(1);
    });

    it('should support mixed element properties and input properties', () => {
      @Component({
        template: `<button myButton [id]="id" [disabled]="isDisabled">Click me</button>`,
        standalone: false,
      })
      class App {
        isDisabled = true;
        id = 0;
      }

      TestBed.configureTestingModule({declarations: [App, MyButton]});
      const fixture = TestBed.createComponent(App);
      const button = fixture.debugElement.query(By.directive(MyButton)).injector.get(MyButton);
      const buttonEl = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(buttonEl.getAttribute('id')).toBe('0');
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(true);

      fixture.componentInstance.isDisabled = false;
      fixture.componentInstance.id = 1;
      fixture.detectChanges();

      expect(buttonEl.getAttribute('id')).toBe('1');
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(false);
    });

    it('should check that property is not an input property before setting (component)', () => {
      @Component({
        selector: 'comp',
        template: '',
        standalone: false,
      })
      class Comp {
        @Input() id: number | undefined;
      }

      @Component({
        template: `<comp [id]="id"></comp>`,
        standalone: false,
      })
      class App {
        id = 1;
      }

      TestBed.configureTestingModule({declarations: [App, Comp]});
      const fixture = TestBed.createComponent(App);
      const compDebugEl = fixture.debugElement.query(By.directive(Comp));
      fixture.detectChanges();

      expect(compDebugEl.nativeElement.hasAttribute('id')).toBe(false);
      expect(compDebugEl.componentInstance.id).toEqual(1);

      fixture.componentInstance.id = 2;
      fixture.detectChanges();

      expect(compDebugEl.nativeElement.hasAttribute('id')).toBe(false);
      expect(compDebugEl.componentInstance.id).toEqual(2);
    });

    it('should support two input properties with the same name', () => {
      @Component({
        template: `<button myButton otherDisabledDir [disabled]="isDisabled">Click me</button>`,
        standalone: false,
      })
      class App {
        isDisabled = true;
      }

      TestBed.configureTestingModule({declarations: [App, MyButton, OtherDisabledDir]});
      const fixture = TestBed.createComponent(App);
      const button = fixture.debugElement.query(By.directive(MyButton)).injector.get(MyButton);
      const otherDisabledDir = fixture.debugElement
        .query(By.directive(OtherDisabledDir))
        .injector.get(OtherDisabledDir);
      const buttonEl = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(true);
      expect(otherDisabledDir.disabled).toEqual(true);

      fixture.componentInstance.isDisabled = false;
      fixture.detectChanges();

      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(false);
      expect(otherDisabledDir.disabled).toEqual(false);
    });

    it('should set input property if there is an output first', () => {
      @Component({
        template: `<button otherDir [id]="id" (click)="onClick()">Click me</button>`,
        standalone: false,
      })
      class App {
        id = 1;
        counter = 0;
        onClick = () => this.counter++;
      }

      TestBed.configureTestingModule({declarations: [App, OtherDir]});
      const fixture = TestBed.createComponent(App);
      const otherDir = fixture.debugElement.query(By.directive(OtherDir)).injector.get(OtherDir);
      const buttonEl = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(buttonEl.hasAttribute('id')).toBe(false);
      expect(otherDir.id).toEqual(1);

      otherDir.clickStream.next();
      expect(fixture.componentInstance.counter).toEqual(1);

      fixture.componentInstance.id = 2;
      fixture.detectChanges();
      expect(otherDir.id).toEqual(2);
    });

    it('should support unrelated element properties at same index in if-else block', () => {
      @Component({
        template: `
          <button idDir [id]="id1">Click me</button>
          <button *ngIf="condition" [id]="id2">Click me too (2)</button>
          <button *ngIf="!condition" otherDir [id]="id3">Click me too (3)</button>
        `,
        standalone: false,
      })
      class App {
        condition = true;
        id1 = 'one';
        id2 = 'two';
        id3 = 3;
      }

      TestBed.configureTestingModule({
        declarations: [App, IdDir, OtherDir],
        imports: [CommonModule],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      let buttonElements = fixture.nativeElement.querySelectorAll('button');
      const idDir = fixture.debugElement.query(By.directive(IdDir)).injector.get(IdDir);

      expect(buttonElements.length).toBe(2);
      expect(buttonElements[0].hasAttribute('id')).toBe(false);
      expect(buttonElements[1].getAttribute('id')).toBe('two');
      expect(buttonElements[1].textContent).toBe('Click me too (2)');
      expect(idDir.idNumber).toBe('one');

      fixture.componentInstance.condition = false;
      fixture.componentInstance.id1 = 'four';
      fixture.detectChanges();

      const otherDir = fixture.debugElement.query(By.directive(OtherDir)).injector.get(OtherDir);
      buttonElements = fixture.nativeElement.querySelectorAll('button');
      expect(buttonElements.length).toBe(2);
      expect(buttonElements[0].hasAttribute('id')).toBe(false);
      expect(buttonElements[1].hasAttribute('id')).toBe(false);
      expect(buttonElements[1].textContent).toBe('Click me too (3)');
      expect(idDir.idNumber).toBe('four');
      expect(otherDir.id).toBe(3);
    });
  });

  describe('attributes and input properties', () => {
    @Directive({
      selector: '[myDir]',
      exportAs: 'myDir',
      standalone: false,
    })
    class MyDir {
      @Input() role: string | undefined;
      @Input('dir') direction: string | undefined;
      @Output('change') changeStream = new EventEmitter<void>();
    }

    @Directive({
      selector: '[myDirB]',
      standalone: false,
    })
    class MyDirB {
      @Input('role') roleB: string | undefined;
    }

    it('should set input property based on attribute if existing', () => {
      @Component({
        template: `<div role="button" myDir></div>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, MyDir]});
      const fixture = TestBed.createComponent(App);
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const divElement = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(divElement.getAttribute('role')).toBe('button');
      expect(divElement.getAttribute('mydir')).toBe('');
      expect(myDir.role).toEqual('button');
    });

    it('should set input property and attribute if both defined', () => {
      @Component({
        template: `<div role="button" [role]="role" myDir></div>`,
        standalone: false,
      })
      class App {
        role = 'listbox';
      }

      TestBed.configureTestingModule({declarations: [App, MyDir]});
      const fixture = TestBed.createComponent(App);
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const divElement = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(divElement.getAttribute('role')).toBe('button');
      expect(myDir.role).toEqual('listbox');

      fixture.componentInstance.role = 'button';
      fixture.detectChanges();
      expect(myDir.role).toEqual('button');
    });

    it('should set two directive input properties based on same attribute', () => {
      @Component({
        template: `<div role="button" myDir myDirB></div>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, MyDir, MyDirB]});
      const fixture = TestBed.createComponent(App);
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const myDirB = fixture.debugElement.query(By.directive(MyDirB)).injector.get(MyDirB);
      const divElement = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(divElement.getAttribute('role')).toBe('button');
      expect(myDir.role).toEqual('button');
      expect(myDirB.roleB).toEqual('button');
    });

    it('should process two attributes on same directive', () => {
      @Component({
        template: `<div role="button" dir="rtl" myDir></div>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, MyDir]});
      const fixture = TestBed.createComponent(App);
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const divElement = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(divElement.getAttribute('role')).toBe('button');
      expect(divElement.getAttribute('dir')).toBe('rtl');
      expect(myDir.role).toEqual('button');
      expect(myDir.direction).toEqual('rtl');
    });

    it('should process attributes and outputs properly together', () => {
      @Component({
        template: `<div role="button" (change)="onChange()" myDir></div>`,
        standalone: false,
      })
      class App {
        counter = 0;
        onChange = () => this.counter++;
      }

      TestBed.configureTestingModule({declarations: [App, MyDir]});
      const fixture = TestBed.createComponent(App);
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const divElement = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(divElement.getAttribute('role')).toBe('button');
      expect(myDir.role).toEqual('button');

      myDir.changeStream.next();
      expect(fixture.componentInstance.counter).toEqual(1);
    });

    it('should process attributes properly for directives with later indices', () => {
      @Component({
        template: `
          <div role="button" dir="rtl" myDir></div>
          <div role="listbox" myDirB></div>
        `,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, MyDir, MyDirB]});
      const fixture = TestBed.createComponent(App);
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const myDirB = fixture.debugElement.query(By.directive(MyDirB)).injector.get(MyDirB);
      const fixtureElements = fixture.nativeElement.children;

      // TODO: Use destructuring once Domino supports native ES2015, or when jsdom is used.
      const buttonEl = fixtureElements[0];
      const listboxEl = fixtureElements[1];

      fixture.detectChanges();

      expect(buttonEl.getAttribute('role')).toBe('button');
      expect(buttonEl.getAttribute('dir')).toBe('rtl');
      expect(listboxEl.getAttribute('role')).toBe('listbox');

      expect(myDir.role).toEqual('button');
      expect(myDir.direction).toEqual('rtl');
      expect(myDirB.roleB).toEqual('listbox');
    });

    it('should support attributes at same index inside an if-else block', () => {
      @Component({
        template: `
          <div role="listbox" myDir></div>
          <div role="button" myDirB *ngIf="condition"></div>
          <div role="menu" *ngIf="!condition"></div>
        `,
        standalone: false,
      })
      class App {
        condition = true;
      }

      TestBed.configureTestingModule({declarations: [App, MyDir, MyDirB], imports: [CommonModule]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const myDirB = fixture.debugElement.query(By.directive(MyDirB)).injector.get(MyDirB);
      let divElements = fixture.nativeElement.querySelectorAll('div');

      expect(divElements.length).toBe(2);
      expect(divElements[0].getAttribute('role')).toBe('listbox');
      expect(divElements[1].getAttribute('role')).toBe('button');
      expect(myDir.role).toEqual('listbox');
      expect(myDirB.roleB).toEqual('button');
      expect((myDirB as any).role).toBeUndefined();

      fixture.componentInstance.condition = false;
      fixture.detectChanges();

      divElements = fixture.nativeElement.querySelectorAll('div');
      expect(divElements.length).toBe(2);
      expect(divElements[0].getAttribute('role')).toBe('listbox');
      expect(divElements[1].getAttribute('role')).toBe('menu');
      expect(myDir.role).toEqual('listbox');
      expect(myDirB.roleB).toEqual('button');
    });

    it('should process attributes properly inside a for loop', () => {
      @Component({
        selector: 'comp',
        template: `<div role="button" myDir #dir="myDir"></div>role: {{dir.role}}`,
        standalone: false,
      })
      class Comp {}

      @Component({
        template: `
          <comp *ngFor="let i of [0, 1]"></comp>
        `,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, MyDir, Comp], imports: [CommonModule]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.children.length).toBe(2);

      const compElements = fixture.nativeElement.children;

      // TODO: Use destructuring once Domino supports native ES2015, or when jsdom is used.
      const comp1 = compElements[0];
      const comp2 = compElements[1];

      expect(comp1.tagName).toBe('COMP');
      expect(comp2.tagName).toBe('COMP');

      expect(comp1.children[0].tagName).toBe('DIV');
      expect(comp1.children[0].getAttribute('role')).toBe('button');
      expect(comp1.textContent).toBe('role: button');

      expect(comp2.children[0].tagName).toBe('DIV');
      expect(comp2.children[0].getAttribute('role')).toBe('button');
      expect(comp2.textContent).toBe('role: button');
    });
  });

  it('should not throw on synthetic property bindings when a directive on the same element injects ViewContainerRef', () => {
    @Component({
      selector: 'my-comp',
      template: '',
      animations: [trigger('trigger', [state('void', style({opacity: 0}))])],
      host: {'[@trigger]': '"void"'},
      standalone: false,
    })
    class MyComp {}

    @Directive({
      selector: '[my-dir]',
      standalone: false,
    })
    class MyDir {
      constructor(public viewContainerRef: ViewContainerRef) {}
    }

    @Component({
      template: '<my-comp my-dir></my-comp>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({
      declarations: [App, MyDir, MyComp],
      imports: [NoopAnimationsModule],
    });

    expect(() => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should allow quoted binding syntax inside property binding', () => {
    @Component({
      template: `<span [id]="'{{ id }}'"></span>`,
      standalone: false,
    })
    class Comp {}

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').id).toBe('{{ id }}');
  });

  it('should allow quoted binding syntax with escaped quotes inside property binding', () => {
    @Component({
      template: `<span [id]="'{{ \\' }}'"></span>`,
      standalone: false,
    })
    class Comp {}

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').id).toBe("{{ ' }}");
  });
});
