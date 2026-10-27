/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {state, style, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {By, DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewContainerRef,
  WritableSignal,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('property bindings', () => {
  it('should support bindings to properties', () => {
    @Component({
      template: `<span [id]="id"></span>`,
    })
    class Comp {
      id: string | undefined;
    }

    const fixture = TestBed.createComponent(Comp);
    const spanEl = fixture.nativeElement.querySelector('span');

    expect(spanEl.id).toBeFalsy();

    fixture.componentInstance.id = 'testId';
    fixture.detectChanges();

    expect(spanEl.id).toBe('testId');
  });

  it('should not set `src` to "undefined" string for img/video elements when bound to undefined', () => {
    @Component({
      template: `
        <img [src]="imgSrc" />
        <video [src]="videoSrc"></video>
      `,
    })
    class Comp {
      imgSrc: string | undefined;
      videoSrc: string | undefined;
    }

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;

    // Both should have their src attribute set to an empty string, not "undefined"
    // (Wait, actually they might not have the attribute if the property is set to '', but `img.src` should not contain 'undefined')
    expect(img.getAttribute('src')).not.toBe('undefined');
    expect(img.getAttribute('src')).toBe('');
    expect(video.getAttribute('src')).not.toBe('undefined');
    expect(video.getAttribute('src')).toBe('');
  });

  it('should update bindings when value changes', async () => {
    @Component({
      template: `<a [title]="title()"></a>`,
    })
    class Comp {
      title = signal('Hello');
    }

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    let a = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(a.title).toBe('Hello');

    fixture.componentInstance.title.set('World');
    await fixture.whenStable();
    expect(a.title).toBe('World');
  });

  it('should not update bindings when value does not change', async () => {
    @Component({
      template: `<a [title]="title()"></a>`,
    })
    class Comp {
      title = signal('Hello');
    }

    const fixture = TestBed.createComponent(Comp);
    await fixture.whenStable();
    let a = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(a.title).toBe('Hello');

    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(a.title).toBe('Hello');
  });

  it('should bind to properties whose names do not correspond to their attribute names', async () => {
    @Component({
      template: '<label [for]="forValue()"></label>',
    })
    class MyComp {
      forValue = signal('some-input');
    }

    const fixture = TestBed.createComponent(MyComp);
    const labelNode = fixture.debugElement.query(By.css('label'));

    await fixture.whenStable();
    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-input');

    fixture.componentInstance.forValue.set('some-textarea');
    await fixture.whenStable();
    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-textarea');
  });

  it(
    'should not map properties whose names do not correspond to their attribute names, ' +
      'if they correspond to inputs',
    async () => {
      @Component({
        template: '',
        selector: 'my-comp',
      })
      class MyComp {
        @Input() for!: string;
      }

      @Component({
        template: '<my-comp [for]="forValue()"></my-comp>',
        imports: [MyComp],
      })
      class App {
        forValue = signal('hello');
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const myCompNode = fixture.debugElement.query(By.directive(MyComp));
      expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
      expect(myCompNode.componentInstance.for).toBe('hello');

      fixture.componentInstance.forValue.set('hej');
      await fixture.whenStable();
      expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
      expect(myCompNode.componentInstance.for).toBe('hej');
    },
  );

  it('should bind ARIA properties', async () => {
    @Component({
      template: '<button [ariaLabel]="label()" [ariaHasPopup]="hasPopup()"></button>',
    })
    class MyComp {
      label = signal('Open');
      hasPopup = signal('menu');
    }

    const fixture = TestBed.createComponent(MyComp);
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    fixture.componentInstance.label.set('Open');
    await fixture.whenStable();
    expect(button.ariaLabel).toBe('Open');
    expect(button.ariaHasPopup).toBe('menu');

    fixture.componentInstance.label.set('Close');
    await fixture.whenStable();

    expect(button.ariaLabel).toBe('Close');
  });

  it('should bind interpolated ARIA attributes', async () => {
    @Component({
      template: '<button aria-label="{{label()}} menu"></button>',
    })
    class MyComp {
      label = signal('Open');
    }

    const fixture = TestBed.createComponent(MyComp);
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    fixture.componentInstance.label.set('Open');
    await fixture.whenStable();

    expect(button.getAttribute('aria-label')).toBe('Open menu');

    fixture.componentInstance.label.set('Close');
    await fixture.whenStable();

    expect(button.getAttribute('aria-label')).toBe('Close menu');
  });

  describe('should bind to ARIA attribute names', () => {
    it('on HTML elements', async () => {
      @Component({
        template: '<button [aria-label]="label()"></button>',
      })
      class MyComp {
        label = signal('Open');
      }

      const fixture = TestBed.createComponent(MyComp);
      const button = fixture.debugElement.query(By.css('button')).nativeElement;

      fixture.componentInstance.label.set('Open');
      await fixture.whenStable();

      expect(button.getAttribute('aria-label')).toBe('Open');

      fixture.componentInstance.label.set('Close');
      await fixture.whenStable();

      expect(button.getAttribute('aria-label')).toBe('Close');
    });

    it('on component elements', async () => {
      @Component({
        selector: 'button[fancy]',
        template: '',
      })
      class FancyButton {}

      @Component({
        template: '<button fancy [aria-label]="label()"></button>',
        imports: [FancyButton],
      })
      class MyComp {
        label = signal('Open');
      }

      const fixture = TestBed.createComponent(MyComp);
      const button = fixture.debugElement.query(By.css('button')).nativeElement;

      await fixture.whenStable();

      expect(button.getAttribute('aria-label')).toBe('Open');

      fixture.componentInstance.label.set('Close');
      await fixture.whenStable();

      expect(button.getAttribute('aria-label')).toBe('Close');
    });
  });

  it('should no bind to ARIA properties if they correspond to inputs', async () => {
    @Component({
      template: '',
      selector: 'my-comp',
    })
    class MyComp {
      @Input() ariaLabel?: string;
    }

    @Component({
      template: '<my-comp [ariaLabel]="label()"></my-comp>',
      imports: [MyComp],
    })
    class App {
      label = signal('a');
    }

    const fixture = TestBed.createComponent(App);
    const myCompNode = fixture.debugElement.query(By.directive(MyComp));

    fixture.componentInstance.label.set('a');
    await fixture.whenStable();

    expect(myCompNode.nativeElement.getAttribute('aria-label')).toBeFalsy();
    expect(myCompNode.componentInstance.ariaLabel).toBe('a');

    fixture.componentInstance.label.set('b');
    await fixture.whenStable();

    expect(myCompNode.nativeElement.getAttribute('aria-label')).toBeFalsy();
    expect(myCompNode.componentInstance.ariaLabel).toBe('b');
  });

  it(
    'should not bind to ARIA properties by their corresponding attribute names, if they ' +
      'correspond to inputs',
    async () => {
      @Component({
        template: '',
        selector: 'my-comp',
      })
      class MyComp {
        @Input({alias: 'aria-label'}) myAriaLabel?: string;
      }

      @Component({
        template: '<my-comp [aria-label]="label()"></my-comp>',
        imports: [MyComp],
      })
      class App {
        label = signal('a');
      }

      const fixture = TestBed.createComponent(App);
      const myCompNode = fixture.debugElement.query(By.directive(MyComp));

      fixture.componentInstance.label.set('a');
      await fixture.whenStable();

      expect(myCompNode.nativeElement.getAttribute('aria-label')).toBeFalsy();
      expect(myCompNode.componentInstance.myAriaLabel).toBe('a');

      fixture.componentInstance.label.set('b');
      await fixture.whenStable();

      expect(myCompNode.nativeElement.getAttribute('aria-label')).toBeFalsy();
      expect(myCompNode.componentInstance.myAriaLabel).toBe('b');
    },
  );

  it('should use the sanitizer in bound properties', async () => {
    @Component({
      template: ` <a [href]="url()"> </a> `,
    })
    class App {
      url: WritableSignal<string | SafeUrl> = signal(
        'javascript:alert("haha, I am taking over your computer!!!");',
      );
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const a = fixture.nativeElement.querySelector('a');

    expect(a.href.indexOf('unsafe:')).toBe(0);

    const domSanitzer: DomSanitizer = TestBed.inject(DomSanitizer);
    fixture.componentInstance.url.set(
      domSanitzer.bypassSecurityTrustUrl('javascript:alert("the developer wanted this");'),
    );
    await fixture.whenStable();

    expect(a.href.indexOf('unsafe:')).toBe(-1);
  });

  it('should not stringify non-string values', () => {
    @Component({
      template: `<input [required]="isRequired" />`,
    })
    class Comp {
      isRequired = false;
    }

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('input')).nativeElement.required).toBe(false);
  });

  it('should support interpolation for properties', async () => {
    @Component({
      template: `<span id="{{ '_' + id() + '_' }}"></span>`,
    })
    class Comp {
      id = signal('testId');
    }

    const fixture = TestBed.createComponent(Comp);
    const spanEl = fixture.nativeElement.querySelector('span');

    await fixture.whenStable();
    expect(spanEl.id).toBe('_testId_');

    fixture.componentInstance.id.set('otherId');
    await fixture.whenStable();
    expect(spanEl.id).toBe('_otherId_');
  });

  describe('input properties', () => {
    @Directive({
      selector: '[myButton]',
    })
    class MyButton {
      @Input() disabled: boolean | undefined;
    }

    @Directive({
      selector: '[otherDir]',
    })
    class OtherDir {
      @Input() id: number | undefined;
      @Output('click') clickStream = new EventEmitter<void>();
    }

    @Directive({
      selector: '[otherDisabledDir]',
    })
    class OtherDisabledDir {
      @Input() disabled: boolean | undefined;
    }

    @Directive({
      selector: '[idDir]',
    })
    class IdDir {
      @Input('id') idNumber: string | undefined;
    }

    it('should check input properties before setting (directives)', async () => {
      @Component({
        template: `<button myButton otherDir [id]="id()" [disabled]="isDisabled()">
          Click me
        </button>`,
        imports: [MyButton, OtherDir],
      })
      class App {
        id = signal(0);
        isDisabled = signal(true);
      }

      const fixture = TestBed.createComponent(App);
      const button = fixture.debugElement.query(By.directive(MyButton)).injector.get(MyButton);
      const otherDir = fixture.debugElement.query(By.directive(OtherDir)).injector.get(OtherDir);
      const buttonEl = fixture.nativeElement.children[0];
      await fixture.whenStable();

      expect(buttonEl.getAttribute('mybutton')).toBe('');
      expect(buttonEl.getAttribute('otherdir')).toBe('');
      expect(buttonEl.hasAttribute('id')).toBe(false);
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(true);
      expect(otherDir.id).toEqual(0);

      fixture.componentInstance.isDisabled.set(false);
      fixture.componentInstance.id.set(1);
      await fixture.whenStable();

      expect(buttonEl.getAttribute('mybutton')).toBe('');
      expect(buttonEl.getAttribute('otherdir')).toBe('');
      expect(buttonEl.hasAttribute('id')).toBe(false);
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(false);
      expect(otherDir.id).toEqual(1);
    });

    it('should support mixed element properties and input properties', async () => {
      @Component({
        template: `<button myButton [id]="id()" [disabled]="isDisabled()">Click me</button>`,
        imports: [MyButton],
      })
      class App {
        isDisabled = signal(true);
        id = signal(0);
      }

      const fixture = TestBed.createComponent(App);
      const button = fixture.debugElement.query(By.directive(MyButton)).injector.get(MyButton);
      const buttonEl = fixture.nativeElement.children[0];
      await fixture.whenStable();

      expect(buttonEl.getAttribute('id')).toBe('0');
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(true);

      fixture.componentInstance.isDisabled.set(false);
      fixture.componentInstance.id.set(1);
      await fixture.whenStable();

      expect(buttonEl.getAttribute('id')).toBe('1');
      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(false);
    });

    it('should check that property is not an input property before setting (component)', async () => {
      @Component({
        selector: 'comp',
        template: '',
      })
      class Comp {
        @Input() id: number | undefined;
      }

      @Component({
        template: `<comp [id]="id()"></comp>`,
        imports: [Comp],
      })
      class App {
        id = signal(1);
      }

      const fixture = TestBed.createComponent(App);
      const compDebugEl = fixture.debugElement.query(By.directive(Comp));
      await fixture.whenStable();

      expect(compDebugEl.nativeElement.hasAttribute('id')).toBe(false);
      expect(compDebugEl.componentInstance.id).toEqual(1);

      fixture.componentInstance.id.set(2);
      await fixture.whenStable();

      expect(compDebugEl.nativeElement.hasAttribute('id')).toBe(false);
      expect(compDebugEl.componentInstance.id).toEqual(2);
    });

    it('should support two input properties with the same name', async () => {
      @Component({
        template: `<button myButton otherDisabledDir [disabled]="isDisabled()">Click me</button>`,
        imports: [MyButton, OtherDisabledDir],
      })
      class App {
        isDisabled = signal(true);
      }

      const fixture = TestBed.createComponent(App);
      const button = fixture.debugElement.query(By.directive(MyButton)).injector.get(MyButton);
      const otherDisabledDir = fixture.debugElement
        .query(By.directive(OtherDisabledDir))
        .injector.get(OtherDisabledDir);
      const buttonEl = fixture.nativeElement.children[0];
      await fixture.whenStable();

      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(true);
      expect(otherDisabledDir.disabled).toEqual(true);

      fixture.componentInstance.isDisabled.set(false);
      await fixture.whenStable();

      expect(buttonEl.hasAttribute('disabled')).toBe(false);
      expect(button.disabled).toEqual(false);
      expect(otherDisabledDir.disabled).toEqual(false);
    });

    it('should set input property if there is an output first', async () => {
      @Component({
        template: `<button otherDir [id]="id()" (click)="onClick()">Click me</button>`,
        imports: [OtherDir],
      })
      class App {
        id = signal(1);
        counter = 0;
        onClick = () => this.counter++;
      }

      const fixture = TestBed.createComponent(App);
      const otherDir = fixture.debugElement.query(By.directive(OtherDir)).injector.get(OtherDir);
      const buttonEl = fixture.nativeElement.children[0];
      await fixture.whenStable();

      expect(buttonEl.hasAttribute('id')).toBe(false);
      expect(otherDir.id).toEqual(1);

      otherDir.clickStream.next();
      expect(fixture.componentInstance.counter).toEqual(1);

      fixture.componentInstance.id.set(2);
      await fixture.whenStable();
      expect(otherDir.id).toEqual(2);
    });

    it('should support unrelated element properties at same index in if-else block', async () => {
      @Component({
        template: `
          <button idDir [id]="id1()">Click me</button>
          <button *ngIf="condition()" [id]="id2()">Click me too (2)</button>
          <button *ngIf="!condition()" otherDir [id]="id3()">Click me too (3)</button>
        `,

        imports: [CommonModule, OtherDir, IdDir],
      })
      class App {
        condition = signal(true);
        id1 = signal('one');
        id2 = signal('two');
        id3 = signal(3);
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      let buttonElements = fixture.nativeElement.querySelectorAll('button');
      const idDir = fixture.debugElement.query(By.directive(IdDir)).injector.get(IdDir);

      expect(buttonElements.length).toBe(2);
      expect(buttonElements[0].hasAttribute('id')).toBe(false);
      expect(buttonElements[1].getAttribute('id')).toBe('two');
      expect(buttonElements[1].textContent).toBe('Click me too (2)');
      expect(idDir.idNumber).toBe('one');

      fixture.componentInstance.condition.set(false);
      fixture.componentInstance.id1.set('four');
      await fixture.whenStable();

      const otherDir = fixture.debugElement.query(By.directive(OtherDir)).injector.get(OtherDir);
      buttonElements = fixture.nativeElement.querySelectorAll('button');
      expect(buttonElements.length).toBe(2);
      expect(buttonElements[0].hasAttribute('id')).toBe(false);
      expect(buttonElements[1].hasAttribute('id')).toBe(false);
      expect(buttonElements[1].textContent).toBe('Click me too (3)');
      expect(idDir.idNumber).toBe('four');
      expect(otherDir.id).toBe(3);
    });

    it('should support input bindings named "field"', async () => {
      // Angular has specialized support for binding to form controls (e.g. `[field]="field"`).
      // This test ensures that `[field]` property bindings can still target other inputs bearing
      // the same name.

      @Directive({selector: '[field]'})
      class Field {
        @Input() field: string | undefined = 'Default control value';
      }

      @Component({
        template: ` <div [field]="value()"></div> `,
        imports: [Field],
      })
      class App {
        value = signal<string | undefined>(undefined);
      }

      const fixture = TestBed.createComponent(App);
      const control = fixture.debugElement.query(By.directive(Field)).injector.get(Field);
      // Yes, because CD hasnt run yet.
      expect(control.field).toBe('Default control value');

      await fixture.whenStable();
      expect(control.field).toBe(undefined);

      fixture.componentInstance.value.set('Bound control value');
      await fixture.whenStable();

      expect(control.field).toBe('Bound control value');
    });
  });

  describe('attributes and input properties', () => {
    @Directive({
      selector: '[myDir]',
      exportAs: 'myDir',
    })
    class MyDir {
      @Input() role: string | undefined;
      @Input('dir') direction: string | undefined;
      @Output('change') changeStream = new EventEmitter<void>();
    }

    @Directive({
      selector: '[myDirB]',
    })
    class MyDirB {
      @Input('role') roleB: string | undefined;
    }

    it('should set input property based on attribute if existing', () => {
      @Component({
        template: `<div role="button" myDir></div>`,

        imports: [MyDir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const divElement = fixture.nativeElement.children[0];
      fixture.detectChanges();

      expect(divElement.getAttribute('role')).toBe('button');
      expect(divElement.getAttribute('mydir')).toBe('');
      expect(myDir.role).toEqual('button');
    });

    it('should set input property and attribute if both defined', async () => {
      @Component({
        template: `<div role="button" [role]="role()" myDir></div>`,

        imports: [MyDir],
      })
      class App {
        role = signal('listbox');
      }

      const fixture = TestBed.createComponent(App);
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const divElement = fixture.nativeElement.children[0];
      await fixture.whenStable();

      expect(divElement.getAttribute('role')).toBe('button');
      expect(myDir.role).toEqual('listbox');

      fixture.componentInstance.role.set('button');
      await fixture.whenStable();
      expect(myDir.role).toEqual('button');
    });

    it('should set two directive input properties based on same attribute', () => {
      @Component({
        template: `<div role="button" myDir myDirB></div>`,

        imports: [MyDir, MyDirB],
      })
      class App {}

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

        imports: [MyDir],
      })
      class App {}

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

        imports: [MyDir],
      })
      class App {
        counter = 0;
        onChange = () => this.counter++;
      }

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

        imports: [MyDir, MyDirB],
      })
      class App {}

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

    it('should support attributes at same index inside an if-else block', async () => {
      @Component({
        template: `
          <div role="listbox" myDir></div>
          <div role="button" myDirB *ngIf="condition()"></div>
          <div role="menu" *ngIf="!condition()"></div>
        `,
        imports: [CommonModule, MyDir, MyDirB],
      })
      class App {
        condition = signal(true);
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      const myDirB = fixture.debugElement.query(By.directive(MyDirB)).injector.get(MyDirB);
      let divElements = fixture.nativeElement.querySelectorAll('div');

      expect(divElements.length).toBe(2);
      expect(divElements[0].getAttribute('role')).toBe('listbox');
      expect(divElements[1].getAttribute('role')).toBe('button');
      expect(myDir.role).toEqual('listbox');
      expect(myDirB.roleB).toEqual('button');
      expect((myDirB as any).role).toBeUndefined();

      fixture.componentInstance.condition.set(false);
      await fixture.whenStable();

      divElements = fixture.nativeElement.querySelectorAll('div');
      expect(divElements.length).toBe(2);
      expect(divElements[0].getAttribute('role')).toBe('listbox');
      expect(divElements[1].getAttribute('role')).toBe('menu');
      expect(myDir.role).toEqual('listbox');
      expect(myDirB.roleB).toEqual('button');
    });

    it('should process attributes properly inside a for loop', () => {
      // prettier-ignore
      @Component({
        selector: 'comp',
        template: `<div role="button" myDir #dir="myDir"></div>role: {{dir.role}}`,
        
       imports: [MyDir]})
      class Comp {}

      // prettier-ignore
      @Component({
        template: `
          <comp *ngFor="let i of [0, 1]"></comp>
        `,
        
       imports: [CommonModule, Comp]})
      class App {}

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
    })
    class MyComp {}

    @Directive({
      selector: '[my-dir]',
    })
    class MyDir {
      constructor(public viewContainerRef: ViewContainerRef) {}
    }

    @Component({
      template: '<my-comp my-dir></my-comp>',

      imports: [MyComp, MyDir],
    })
    class App {}

    TestBed.configureTestingModule({
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
    })
    class Comp {}

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').id).toBe('{{ id }}');
  });

  it('should allow quoted binding syntax with escaped quotes inside property binding', () => {
    @Component({
      template: `<span [id]="'{{ \\' }}'"></span>`,
    })
    class Comp {}

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').id).toBe("{{ ' }}");
  });
});
