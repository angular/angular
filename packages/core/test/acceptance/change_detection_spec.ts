/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {expect} from '@angular/private/testing/matchers';
import {BehaviorSubject} from 'rxjs';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  Directive,
  DoCheck,
  EmbeddedViewRef,
  ErrorHandler,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  provideCheckNoChangesConfig,
  provideZoneChangeDetection,
  provideZonelessChangeDetection,
  QueryList,
  ɵRuntimeError as RuntimeError,
  ɵRuntimeErrorCode as RuntimeErrorCode,
  TemplateRef,
  Type,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '../../src/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '../../testing';

describe('change detection', () => {
  it('can provide zone and zoneless (last one wins like any other provider) in TestBed', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), provideZoneChangeDetection()],
      });
      TestBed.inject(ApplicationRef);
    }).not.toThrow();
  });
  describe('embedded views', () => {
    @Directive({
      selector: '[viewManipulation]',
      exportAs: 'vm',
      standalone: false,
    })
    class ViewManipulation {
      constructor(
        private _tplRef: TemplateRef<{}>,
        public vcRef: ViewContainerRef,
        private _appRef: ApplicationRef,
      ) {}

      insertIntoVcRef() {
        return this.vcRef.createEmbeddedView(this._tplRef);
      }

      insertIntoAppRef(): EmbeddedViewRef<{}> {
        const viewRef = this._tplRef.createEmbeddedView({});
        this._appRef.attachView(viewRef);
        return viewRef;
      }
    }

    @Component({
      selector: 'test-cmp',
      template: `
        <ng-template #vm="vm" viewManipulation>{{'change-detected'}}</ng-template>
      `,
      standalone: false,
    })
    class TestCmpt {}

    it('should detect changes for embedded views inserted through ViewContainerRef', () => {
      TestBed.configureTestingModule({declarations: [TestCmpt, ViewManipulation]});
      const fixture = TestBed.createComponent(TestCmpt);
      const vm = fixture.debugElement.childNodes[0].references['vm'] as ViewManipulation;

      vm.insertIntoVcRef();
      fixture.detectChanges();

      expect(fixture.nativeElement).toHaveText('change-detected');
    });

    it('should detect changes for embedded views attached to ApplicationRef', () => {
      TestBed.configureTestingModule({declarations: [TestCmpt, ViewManipulation]});
      const fixture = TestBed.createComponent(TestCmpt);
      const vm = fixture.debugElement.childNodes[0].references['vm'] as ViewManipulation;

      const viewRef = vm.insertIntoAppRef();

      // A newly created view was attached to the CD tree via ApplicationRef so should be also
      // change detected when ticking root component
      fixture.detectChanges();

      expect(viewRef.rootNodes[0]).toHaveText('change-detected');
    });

    it('should not detect changes for OnPush embedded views when they are not dirty', () => {
      @Component({
        selector: 'onpush',
        template: '',
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class OnPushComponent {
        checks = 0;
        cdRef = inject(ChangeDetectorRef);
        ngDoCheck() {
          this.checks++;
        }
      }

      @Component({template: '<ng-template #template></ng-template>'})
      class Container {
        @ViewChild('template', {read: ViewContainerRef, static: true}) vcr!: ViewContainerRef;
      }
      const fixture = TestBed.createComponent(Container);
      const ref = fixture.componentInstance.vcr!.createComponent(OnPushComponent);

      fixture.detectChanges(false);
      expect(ref.instance.checks).toBe(1);

      fixture.detectChanges(false);
      expect(ref.instance.checks).toBe(1);

      ref.instance.cdRef.markForCheck();
      fixture.detectChanges(false);
      expect(ref.instance.checks).toBe(2);
    });

    it('should not detect changes in child embedded views while they are detached', () => {
      const counters = {componentView: 0, embeddedView: 0};

      @Component({
        template: `
          <div>{{increment('componentView')}}</div>
          <ng-template #vm="vm" viewManipulation>{{increment('embeddedView')}}</ng-template>
        `,
        standalone: false,
      })
      class App {
        increment(counter: 'componentView' | 'embeddedView') {
          counters[counter]++;
        }
      }

      TestBed.configureTestingModule({declarations: [App, ViewManipulation]});
      const fixture = TestBed.createComponent(App);
      const vm: ViewManipulation = fixture.debugElement.childNodes[1].references['vm'];
      const viewRef = vm.insertIntoVcRef();
      viewRef.detach();
      fixture.detectChanges();

      expect(counters).toEqual({componentView: 2, embeddedView: 0});

      // Re-attach the view to ensure that the process can be reversed.
      viewRef.reattach();
      fixture.detectChanges();

      expect(counters).toEqual({componentView: 4, embeddedView: 2});
    });

    it('should not detect changes in child component views while they are detached', () => {
      let counter = 0;

      @Component({
        template: `<ng-template #vm="vm" viewManipulation></ng-template>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class App {}

      @Component({
        template: `
          <button (click)="noop()">Trigger change detection</button>
          <div>{{increment()}}</div>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class DynamicComp {
        increment() {
          counter++;
        }
        noop() {}
      }

      TestBed.configureTestingModule({declarations: [App, ViewManipulation, DynamicComp]});
      const fixture = TestBed.createComponent(App);
      const vm: ViewManipulation = fixture.debugElement.childNodes[0].references['vm'];
      const componentRef = vm.vcRef.createComponent(DynamicComp);
      const button = fixture.nativeElement.querySelector('button');
      fixture.detectChanges();

      expect(counter).toBe(1);

      button.click();
      fixture.detectChanges();
      expect(counter).toBe(2);

      componentRef.changeDetectorRef.detach();
      button.click();
      fixture.detectChanges();

      expect(counter).toBe(2);

      // Re-attach the change detector to ensure that the process can be reversed.
      componentRef.changeDetectorRef.reattach();
      button.click();
      fixture.detectChanges();

      expect(counter).toBe(3);
    });
  });

  describe('markForCheck', () => {
    it('should mark OnPush ancestor of dynamically created component views as dirty', () => {
      @Component({
        selector: `test-cmpt`,
        template: `{{counter}}|<ng-template #vc></ng-template>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class TestCmpt {
        counter = 0;
        @ViewChild('vc', {read: ViewContainerRef}) vcRef!: ViewContainerRef;

        createComponentView<T>(cmptType: Type<T>): ComponentRef<T> {
          return this.vcRef.createComponent(cmptType);
        }
      }

      @Component({
        selector: 'dynamic-cmpt',
        template: `dynamic|{{binding}}`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class DynamicCmpt {
        @Input() binding = 'binding';
      }

      const fixture = TestBed.createComponent(TestCmpt);

      // initial CD to have query results
      // NOTE: we call change detection without checkNoChanges to have clearer picture
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('0|');

      // insert a dynamic component, but do not specifically mark parent dirty
      // (dynamic components with OnPush flag are created with the `Dirty` flag)
      const dynamicCmptRef = fixture.componentInstance.createComponentView(DynamicCmpt);
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('0|dynamic|binding');

      // update model in the OnPush component - should not update UI
      fixture.componentInstance.counter = 1;
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('0|dynamic|binding');

      // now mark the dynamically inserted component as dirty
      dynamicCmptRef.changeDetectorRef.markForCheck();
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('1|dynamic|binding');

      // Update, mark for check, and detach before change detection, should not update
      dynamicCmptRef.setInput('binding', 'updatedBinding');
      dynamicCmptRef.changeDetectorRef.markForCheck();
      dynamicCmptRef.changeDetectorRef.detach();
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('1|dynamic|binding');

      // reattaching and run CD from the top should update
      dynamicCmptRef.changeDetectorRef.reattach();
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('1|dynamic|updatedBinding');
    });

    it('should support re-enterant change detection', () => {
      @Component({
        selector: 'has-host-binding',
        template: '..',
        host: {
          '[class.x]': 'x',
        },
        standalone: false,
      })
      class HasHostBinding {
        x = true;
      }

      @Component({
        selector: 'child',
        template: '<has-host-binding></has-host-binding>',
        inputs: ['input'],
        standalone: false,
      })
      class Child {
        /**
         * @internal
         */
        private _input!: number;

        constructor(private cdr: ChangeDetectorRef) {}

        get input() {
          return this._input;
        }

        set input(value: number) {
          this._input = value;
          this.cdr.detectChanges();
        }
      }

      @Component({
        selector: 'root',
        template: '<child [input]="3"></child>',
        standalone: false,
      })
      class Root {}

      TestBed.configureTestingModule({
        declarations: [Root, Child, HasHostBinding],
      });

      TestBed.createComponent(Root).detectChanges();
    });
  });

  describe('OnPush', () => {
    @Component({
      selector: 'my-comp',
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `{{ doCheckCount }} - {{ name }} <button (click)="onClick()"></button>`,
      standalone: false,
    })
    class MyComponent implements DoCheck {
      @Input() name = 'Nancy';
      doCheckCount = 0;

      ngDoCheck(): void {
        this.doCheckCount++;
      }

      onClick() {}
    }

    @Component({
      selector: 'my-app',
      template: '<my-comp [name]="name"></my-comp>',
      standalone: false,
    })
    class MyApp {
      @ViewChild(MyComponent) comp!: MyComponent;
      name: string = 'Nancy';
    }

    it('should check OnPush components on initialization', () => {
      TestBed.configureTestingModule({declarations: [MyComponent, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - Nancy');
    });

    it('should call doCheck even when OnPush components are not dirty', () => {
      TestBed.configureTestingModule({declarations: [MyComponent, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      fixture.detectChanges();
      expect(fixture.componentInstance.comp.doCheckCount).toEqual(2);

      fixture.detectChanges();
      expect(fixture.componentInstance.comp.doCheckCount).toEqual(3);
    });

    it('should skip OnPush components in update mode when they are not dirty', () => {
      TestBed.configureTestingModule({declarations: [MyComponent, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      // doCheckCount is 2, but 1 should be rendered since it has not been marked dirty.
      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - Nancy');

      fixture.detectChanges();

      // doCheckCount is 3, but 1 should be rendered since it has not been marked dirty.
      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - Nancy');
    });

    it('should check OnPush components in update mode when inputs change', () => {
      TestBed.configureTestingModule({declarations: [MyComponent, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      fixture.componentInstance.name = 'Bess';
      fixture.detectChanges();

      expect(fixture.componentInstance.comp.doCheckCount).toEqual(2);
      // View should update, as changed input marks view dirty
      expect(fixture.nativeElement.textContent.trim()).toEqual('2 - Bess');

      fixture.componentInstance.name = 'George';
      fixture.detectChanges();

      // View should update, as changed input marks view dirty
      expect(fixture.componentInstance.comp.doCheckCount).toEqual(3);
      expect(fixture.nativeElement.textContent.trim()).toEqual('3 - George');

      fixture.detectChanges();

      expect(fixture.componentInstance.comp.doCheckCount).toEqual(4);
      // View should not be updated to "4", as inputs have not changed.
      expect(fixture.nativeElement.textContent.trim()).toEqual('3 - George');
    });

    it('should check OnPush components in update mode when component events occur', () => {
      TestBed.configureTestingModule({declarations: [MyComponent, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(fixture.componentInstance.comp.doCheckCount).toEqual(1);
      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - Nancy');

      const button = fixture.nativeElement.querySelector('button')!;
      button.click();

      // No ticks should have been scheduled.
      expect(fixture.componentInstance.comp.doCheckCount).toEqual(1);
      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - Nancy');

      fixture.detectChanges();

      // Because the onPush comp should be dirty, it should update once CD runs
      expect(fixture.componentInstance.comp.doCheckCount).toEqual(2);
      expect(fixture.nativeElement.textContent.trim()).toEqual('2 - Nancy');
    });

    it('should not check OnPush components in update mode when parent events occur', () => {
      @Component({
        selector: 'button-parent',
        template: '<my-comp></my-comp><button id="parent" (click)="noop()"></button>',
        standalone: false,
      })
      class ButtonParent {
        @ViewChild(MyComponent) comp!: MyComponent;
        noop() {}
      }

      TestBed.configureTestingModule({declarations: [MyComponent, ButtonParent]});
      const fixture = TestBed.createComponent(ButtonParent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - Nancy');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button#parent');
      button.click();
      fixture.detectChanges();

      // The comp should still be clean. So doCheck will run, but the view should display 1.
      expect(fixture.componentInstance.comp.doCheckCount).toEqual(2);
      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - Nancy');
    });

    it('should check parent OnPush components in update mode when child events occur', () => {
      @Component({
        selector: 'button-parent',
        template: '{{ doCheckCount }} - <my-comp></my-comp>',
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class ButtonParent implements DoCheck {
        @ViewChild(MyComponent) comp!: MyComponent;
        noop() {}

        doCheckCount = 0;
        ngDoCheck(): void {
          this.doCheckCount++;
        }
      }

      @Component({
        selector: 'my-button-app',
        template: '<button-parent></button-parent>',
        standalone: false,
      })
      class MyButtonApp {
        @ViewChild(ButtonParent) parent!: ButtonParent;
      }

      TestBed.configureTestingModule({declarations: [MyButtonApp, MyComponent, ButtonParent]});
      const fixture = TestBed.createComponent(MyButtonApp);
      fixture.detectChanges();

      const parent = fixture.componentInstance.parent;
      const comp = parent.comp;

      expect(parent.doCheckCount).toEqual(1);
      expect(comp.doCheckCount).toEqual(1);
      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - 1 - Nancy');

      fixture.detectChanges();
      expect(parent.doCheckCount).toEqual(2);
      // parent isn't checked, so child doCheck won't run
      expect(comp.doCheckCount).toEqual(1);
      expect(fixture.nativeElement.textContent.trim()).toEqual('1 - 1 - Nancy');

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      // No ticks should have been scheduled.
      expect(parent.doCheckCount).toEqual(2);
      expect(comp.doCheckCount).toEqual(1);

      fixture.detectChanges();
      expect(parent.doCheckCount).toEqual(3);
      expect(comp.doCheckCount).toEqual(2);
      expect(fixture.nativeElement.textContent.trim()).toEqual('3 - 2 - Nancy');
    });

    it('should check parent OnPush components when child directive on a template emits event', fakeAsync(() => {
      @Directive({
        selector: '[emitter]',
        standalone: false,
      })
      class Emitter {
        @Output() event = new EventEmitter<string>();

        ngOnInit() {
          setTimeout(() => {
            this.event.emit('new message');
          });
        }
      }

      @Component({
        selector: 'my-app',
        template: '{{message}} <ng-template emitter (event)="message = $event"></ng-template>',
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class MyApp {
        message = 'initial message';
      }

      const fixture = TestBed.configureTestingModule({
        declarations: [MyApp, Emitter],
      }).createComponent(MyApp);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toEqual('initial message');
      tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toEqual('new message');
    }));
  });

  describe('ChangeDetectorRef', () => {
    describe('detectChanges()', () => {
      @Component({
        selector: 'my-comp',
        template: '{{ name }}',
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class MyComp implements DoCheck {
        doCheckCount = 0;
        name = 'Nancy';

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() {
          this.doCheckCount++;
        }
      }

      @Component({
        selector: 'parent-comp',
        template: `{{ doCheckCount}} - <my-comp></my-comp>`,
        standalone: false,
      })
      class ParentComp implements DoCheck {
        @ViewChild(MyComp) myComp!: MyComp;

        doCheckCount = 0;

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() {
          this.doCheckCount++;
        }
      }

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir {
        constructor(public cdr: ChangeDetectorRef) {}
      }

      it('should check the component view when called by component (even when OnPush && clean)', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('Nancy');

        fixture.componentInstance.name = 'Bess'; // as this is not an Input, the component stays clean
        fixture.componentInstance.cdr.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('Bess');
      });

      it('should NOT call component doCheck when called by a component', () => {
        TestBed.configureTestingModule({declarations: [MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        expect(fixture.componentInstance.doCheckCount).toEqual(1);

        // NOTE: in current Angular, detectChanges does not itself trigger doCheck, but you
        // may see doCheck called in some cases bc of the extra CD run triggered by zone.js.
        // It's important not to call doCheck to allow calls to detectChanges in that hook.
        fixture.componentInstance.cdr.detectChanges();
        expect(fixture.componentInstance.doCheckCount).toEqual(1);
      });

      it('should NOT check the component parent when called by a child component', () => {
        TestBed.configureTestingModule({declarations: [MyComp, ParentComp]});
        const fixture = TestBed.createComponent(ParentComp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('1 - Nancy');

        fixture.componentInstance.doCheckCount = 100;
        fixture.componentInstance.myComp.cdr.detectChanges();
        expect(fixture.componentInstance.doCheckCount).toEqual(100);
        expect(fixture.nativeElement.textContent).toEqual('1 - Nancy');
      });

      it('should check component children when called by component if dirty or check-always', () => {
        TestBed.configureTestingModule({declarations: [MyComp, ParentComp]});
        const fixture = TestBed.createComponent(ParentComp);
        fixture.detectChanges();
        expect(fixture.componentInstance.doCheckCount).toEqual(1);

        fixture.componentInstance.myComp.name = 'Bess';
        fixture.componentInstance.cdr.detectChanges();
        expect(fixture.componentInstance.doCheckCount).toEqual(1);
        expect(fixture.componentInstance.myComp.doCheckCount).toEqual(2);
        // OnPush child is not dirty, so its change isn't rendered.
        expect(fixture.nativeElement.textContent).toEqual('1 - Nancy');
      });

      it('should not group detectChanges calls (call every time)', () => {
        TestBed.configureTestingModule({declarations: [MyComp, ParentComp]});
        const fixture = TestBed.createComponent(ParentComp);
        fixture.detectChanges();

        expect(fixture.componentInstance.doCheckCount).toEqual(1);

        fixture.componentInstance.cdr.detectChanges();
        fixture.componentInstance.cdr.detectChanges();
        expect(fixture.componentInstance.myComp.doCheckCount).toEqual(3);
      });

      it('should check component view when called by directive on component node', () => {
        @Component({
          template: '<my-comp dir></my-comp>',
          standalone: false,
        })
        class MyApp {
          @ViewChild(MyComp) myComp!: MyComp;
          @ViewChild(Dir) dir!: Dir;
        }

        TestBed.configureTestingModule({declarations: [MyComp, Dir, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('Nancy');

        fixture.componentInstance.myComp.name = 'George';
        fixture.componentInstance.dir.cdr.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('George');
      });

      it('should check host component when called by directive on element node', () => {
        @Component({
          template: '{{ value }}<div dir></div>',
          standalone: false,
        })
        class MyApp {
          @ViewChild(MyComp) myComp!: MyComp;
          @ViewChild(Dir) dir!: Dir;
          value = '';
        }

        TestBed.configureTestingModule({declarations: [Dir, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        fixture.componentInstance.value = 'Frank';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('Frank');

        fixture.componentInstance.value = 'Joe';
        fixture.componentInstance.dir.cdr.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('Joe');
      });

      it('should check the host component when called from EmbeddedViewRef', () => {
        @Component({
          template: '{{ name }}<div *ngIf="showing" dir></div>',
          standalone: false,
        })
        class MyApp {
          @ViewChild(Dir) dir!: Dir;
          showing = true;
          name = 'Amelia';
        }

        TestBed.configureTestingModule({declarations: [Dir, MyApp], imports: [CommonModule]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('Amelia');

        fixture.componentInstance.name = 'Emerson';
        fixture.componentInstance.dir.cdr.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('Emerson');
      });

      it('should support call in ngOnInit', () => {
        @Component({
          template: '{{ value }}',
          standalone: false,
        })
        class DetectChangesComp implements OnInit {
          value = 0;

          constructor(public cdr: ChangeDetectorRef) {}

          ngOnInit() {
            this.value++;
            this.cdr.detectChanges();
          }
        }

        TestBed.configureTestingModule({declarations: [DetectChangesComp]});
        const fixture = TestBed.createComponent(DetectChangesComp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('1');
      });

      ['OnInit', 'AfterContentInit', 'AfterViewInit', 'OnChanges'].forEach((hook) => {
        it(`should not go infinite loop when recursively called from children's ng${hook}`, () => {
          @Component({
            template: '<child-comp [inp]="true"></child-comp>',
            standalone: false,
          })
          class ParentComp {
            constructor(public cdr: ChangeDetectorRef) {}
            triggerChangeDetection() {
              this.cdr.detectChanges();
            }
          }

          @Component({
            template: '{{inp}}',
            selector: 'child-comp',
            standalone: false,
          })
          class ChildComp {
            @Input() inp: any = '';

            count = 0;
            constructor(public parentComp: ParentComp) {}

            ngOnInit() {
              this.check('OnInit');
            }
            ngAfterContentInit() {
              this.check('AfterContentInit');
            }
            ngAfterViewInit() {
              this.check('AfterViewInit');
            }
            ngOnChanges() {
              this.check('OnChanges');
            }

            check(h: string) {
              if (h === hook) {
                this.count++;
                if (this.count > 1) throw new Error(`ng${hook} should be called only once!`);
                this.parentComp.triggerChangeDetection();
              }
            }
          }

          TestBed.configureTestingModule({declarations: [ParentComp, ChildComp]});

          expect(() => {
            const fixture = TestBed.createComponent(ParentComp);
            fixture.detectChanges();
          }).not.toThrow();
        });
      });

      it('should support call in ngDoCheck', () => {
        @Component({
          template: '{{doCheckCount}}',
          standalone: false,
        })
        class DetectChangesComp {
          doCheckCount = 0;

          constructor(public cdr: ChangeDetectorRef) {}

          ngDoCheck() {
            this.doCheckCount++;
            this.cdr.detectChanges();
          }
        }

        TestBed.configureTestingModule({declarations: [DetectChangesComp]});
        const fixture = TestBed.createComponent(DetectChangesComp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('1');
      });

      it('should support change detection triggered as a result of View queries processing', () => {
        @Component({
          selector: 'app',
          template: `
            <div *ngIf="visible" #ref>Visible text</div>
          `,
          standalone: false,
        })
        class App {
          @ViewChildren('ref') ref!: QueryList<any>;

          visible = false;

          constructor(public changeDetectorRef: ChangeDetectorRef) {}

          ngAfterViewInit() {
            this.ref.changes.subscribe((refs: QueryList<any>) => {
              this.visible = false;
              this.changeDetectorRef.detectChanges();
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [App],
          imports: [CommonModule],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toBe('');

        // even though we set "visible" to `true`, we do not expect any content to be displayed,
        // since the flag is overridden in `ngAfterViewInit` back to `false`
        fixture.componentInstance.visible = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toBe('');
      });

      describe('dynamic views', () => {
        @Component({
          selector: 'structural-comp',
          template: '{{ value }}',
          standalone: false,
        })
        class StructuralComp {
          @Input() tmp!: TemplateRef<any>;
          value = 'one';

          constructor(public vcr: ViewContainerRef) {}

          create() {
            return this.vcr.createEmbeddedView(this.tmp, {ctx: this});
          }
        }

        it('should support ViewRef.detectChanges()', () => {
          @Component({
            template:
              '<ng-template #foo let-ctx="ctx">{{ ctx.value }}</ng-template><structural-comp [tmp]="foo"></structural-comp>',
            standalone: false,
          })
          class App {
            @ViewChild(StructuralComp) structuralComp!: StructuralComp;
          }

          TestBed.configureTestingModule({declarations: [App, StructuralComp]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toEqual('one');

          const viewRef: EmbeddedViewRef<any> = fixture.componentInstance.structuralComp.create();
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toEqual('oneone');

          // check embedded view update
          fixture.componentInstance.structuralComp.value = 'two';
          viewRef.detectChanges();
          expect(fixture.nativeElement.textContent).toEqual('onetwo');

          // check root view update
          fixture.componentInstance.structuralComp.value = 'three';
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toEqual('threethree');
        });

        it('should support ViewRef.detectChanges() directly after creation', () => {
          @Component({
            template: '<ng-template #foo>Template text</ng-template><structural-comp [tmp]="foo">',
            standalone: false,
          })
          class App {
            @ViewChild(StructuralComp) structuralComp!: StructuralComp;
          }

          TestBed.configureTestingModule({declarations: [App, StructuralComp]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          expect(fixture.nativeElement.textContent).toEqual('one');

          const viewRef: EmbeddedViewRef<any> = fixture.componentInstance.structuralComp.create();
          viewRef.detectChanges();
          expect(fixture.nativeElement.textContent).toEqual('oneTemplate text');
        });
      });
    });

    describe('attach/detach', () => {
      @Component({
        selector: 'detached-comp',
        template: '{{ value }}',
        standalone: false,
      })
      class DetachedComp implements DoCheck {
        value = 'one';
        doCheckCount = 0;

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() {
          this.doCheckCount++;
        }
      }

      @Component({
        template: '<detached-comp></detached-comp>',
        standalone: false,
      })
      class MyApp {
        @ViewChild(DetachedComp) comp!: DetachedComp;

        constructor(public cdr: ChangeDetectorRef) {}
      }

      it('should not check detached components', () => {
        TestBed.configureTestingModule({declarations: [MyApp, DetachedComp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('one');

        fixture.componentInstance.comp.cdr.detach();

        fixture.componentInstance.comp.value = 'two';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one');
      });

      it('should check re-attached components', () => {
        TestBed.configureTestingModule({declarations: [MyApp, DetachedComp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('one');

        fixture.componentInstance.comp.cdr.detach();
        fixture.componentInstance.comp.value = 'two';

        fixture.componentInstance.comp.cdr.reattach();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('two');
      });

      it('should call lifecycle hooks on detached components', () => {
        TestBed.configureTestingModule({declarations: [MyApp, DetachedComp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        expect(fixture.componentInstance.comp.doCheckCount).toEqual(1);

        fixture.componentInstance.comp.cdr.detach();

        fixture.detectChanges();
        expect(fixture.componentInstance.comp.doCheckCount).toEqual(2);
      });

      it('should check detached component when detectChanges is called', () => {
        TestBed.configureTestingModule({declarations: [MyApp, DetachedComp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('one');

        fixture.componentInstance.comp.cdr.detach();

        fixture.componentInstance.comp.value = 'two';
        fixture.componentInstance.comp.cdr.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('two');
      });

      it('should not check detached component when markDirty is called', () => {
        TestBed.configureTestingModule({declarations: [MyApp, DetachedComp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
        const comp = fixture.componentInstance.comp;

        comp.cdr.detach();
        comp.value = 'two';
        comp.cdr.markForCheck();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('one');
      });

      it('should detach any child components when parent is detached', () => {
        TestBed.configureTestingModule({declarations: [MyApp, DetachedComp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('one');

        fixture.componentInstance.cdr.detach();

        fixture.componentInstance.comp.value = 'two';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one');

        fixture.componentInstance.cdr.reattach();

        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('two');
      });

      it('should detach OnPush components properly', () => {
        @Component({
          selector: 'on-push-comp',
          template: '{{ value }}',
          changeDetection: ChangeDetectionStrategy.OnPush,
          standalone: false,
        })
        class OnPushComp {
          @Input() value!: string;

          constructor(public cdr: ChangeDetectorRef) {}
        }

        @Component({
          template: '<on-push-comp [value]="value"></on-push-comp>',
          standalone: false,
        })
        class OnPushApp {
          @ViewChild(OnPushComp) onPushComp!: OnPushComp;
          value = '';
        }

        TestBed.configureTestingModule({declarations: [OnPushApp, OnPushComp]});
        const fixture = TestBed.createComponent(OnPushApp);
        fixture.detectChanges();

        fixture.componentInstance.value = 'one';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one');

        fixture.componentInstance.onPushComp.cdr.detach();

        fixture.componentInstance.value = 'two';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one');

        fixture.componentInstance.onPushComp.cdr.reattach();

        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('two');
      });
    });

    describe('markForCheck()', () => {
      @Component({
        selector: 'on-push-comp',
        template: '{{ value }}',
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class OnPushComp implements DoCheck {
        value = 'one';

        doCheckCount = 0;

        constructor(public cdr: ChangeDetectorRef) {}

        ngDoCheck() {
          this.doCheckCount++;
        }
      }

      @Component({
        template: '{{ value }} - <on-push-comp></on-push-comp>',
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class OnPushParent {
        @ViewChild(OnPushComp) comp!: OnPushComp;
        value = 'one';
      }

      it('should ensure OnPush components are checked', () => {
        TestBed.configureTestingModule({declarations: [OnPushParent, OnPushComp]});
        const fixture = TestBed.createComponent(OnPushParent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('one - one');

        fixture.componentInstance.comp.value = 'two';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one - one');

        fixture.componentInstance.comp.cdr.markForCheck();

        // Change detection should not have run yet, since markForCheck
        // does not itself schedule change detection.
        expect(fixture.nativeElement.textContent).toEqual('one - one');

        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one - two');
      });

      it('should never schedule change detection on its own', () => {
        TestBed.configureTestingModule({declarations: [OnPushParent, OnPushComp]});
        const fixture = TestBed.createComponent(OnPushParent);
        fixture.detectChanges();
        const comp = fixture.componentInstance.comp;

        expect(comp.doCheckCount).toEqual(1);

        comp.cdr.markForCheck();
        comp.cdr.markForCheck();

        expect(comp.doCheckCount).toEqual(1);
      });

      it('should ensure ancestor OnPush components are checked', () => {
        TestBed.configureTestingModule({declarations: [OnPushParent, OnPushComp]});
        const fixture = TestBed.createComponent(OnPushParent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('one - one');

        fixture.componentInstance.value = 'two';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one - one');

        fixture.componentInstance.comp.cdr.markForCheck();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('two - one');
      });

      it('should ensure OnPush components in embedded views are checked', () => {
        @Component({
          template: '{{ value }} - <on-push-comp *ngIf="showing"></on-push-comp>',
          changeDetection: ChangeDetectionStrategy.OnPush,
          standalone: false,
        })
        class EmbeddedViewParent {
          @ViewChild(OnPushComp) comp!: OnPushComp;
          value = 'one';
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [EmbeddedViewParent, OnPushComp],
          imports: [CommonModule],
        });
        const fixture = TestBed.createComponent(EmbeddedViewParent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toEqual('one - one');

        fixture.componentInstance.comp.value = 'two';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one - one');

        fixture.componentInstance.comp.cdr.markForCheck();
        // markForCheck should not trigger change detection on its own.
        expect(fixture.nativeElement.textContent).toEqual('one - one');

        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one - two');

        fixture.componentInstance.value = 'two';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('one - two');

        fixture.componentInstance.comp.cdr.markForCheck();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('two - two');
      });

      it('async pipe should trigger CD for embedded views where the declaration and insertion views are different', () => {
        @Component({
          selector: 'insertion',
          changeDetection: ChangeDetectionStrategy.OnPush,
          template: ` <ng-container [ngTemplateOutlet]="template"> </ng-container> `,
          standalone: false,
        })
        class Insertion {
          @Input() template!: TemplateRef<{}>;
        }

        // This component uses async pipe (which calls markForCheck) in a view that has different
        // insertion and declaration views.
        @Component({
          changeDetection: ChangeDetectionStrategy.OnPush,
          template: `
          <insertion [template]="ref"></insertion>
          <ng-template #ref>
            <span>{{value | async}}</span>
          </ng-template>
          `,
          standalone: false,
        })
        class Declaration {
          value = new BehaviorSubject('initial value');
        }

        const fixture = TestBed.configureTestingModule({
          declarations: [Insertion, Declaration],
        }).createComponent(Declaration);
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.textContent).toContain('initial value');
        fixture.componentInstance.value.next('new value');
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.textContent).toContain('new value');
      });

      // TODO(kara): add test for dynamic views once bug fix is in
    });

    describe('checkNoChanges', () => {
      let comp: NoChangesComp;

      @Component({
        selector: 'no-changes-comp',
        template: '{{ value }}',
        standalone: false,
      })
      class NoChangesComp {
        value = 1;
        doCheckCount = 0;
        contentCheckCount = 0;
        viewCheckCount = 0;

        ngDoCheck() {
          this.doCheckCount++;
        }

        ngAfterContentChecked() {
          this.contentCheckCount++;
        }

        ngAfterViewChecked() {
          this.viewCheckCount++;
        }

        constructor(public cdr: ChangeDetectorRef) {
          comp = this;
        }
      }

      @Component({
        template: '{{ value }} - <no-changes-comp></no-changes-comp>',
        standalone: false,
      })
      class AppComp {
        value = 1;

        constructor(public cdr: ChangeDetectorRef) {}
      }

      // Custom error handler that just rethrows all the errors from the
      // view, rather than logging them out. Used to keep our logs clean.
      class RethrowErrorHandler extends ErrorHandler {
        override handleError(error: any) {
          throw error;
        }
      }

      it('should throw if bindings in current view have changed', () => {
        TestBed.configureTestingModule({
          declarations: [NoChangesComp],
          providers: [{provide: ErrorHandler, useClass: RethrowErrorHandler}],
        });
        const fixture = TestBed.createComponent(NoChangesComp);

        expect(() => {
          fixture.componentInstance.cdr.checkNoChanges();
        }).toThrowError(
          /ExpressionChangedAfterItHasBeenCheckedError: .+ Previous value: '.*undefined'. Current value: '.*1'/gi,
        );
      });

      it('should throw if interpolations in current view have changed', () => {
        TestBed.configureTestingModule({
          declarations: [AppComp, NoChangesComp],
          providers: [{provide: ErrorHandler, useClass: RethrowErrorHandler}],
        });
        const fixture = TestBed.createComponent(AppComp);

        expect(() => fixture.componentInstance.cdr.checkNoChanges()).toThrowError(
          /ExpressionChangedAfterItHasBeenCheckedError: .+ Previous value: '.*undefined'. Current value: '.*1'/gi,
        );
      });

      it('should throw if bindings in embedded view have changed', () => {
        @Component({
          template: '<span *ngIf="showing">{{ showing }}</span>',
          standalone: false,
        })
        class EmbeddedViewApp {
          showing = true;
          constructor(public cdr: ChangeDetectorRef) {}
        }

        TestBed.configureTestingModule({
          declarations: [EmbeddedViewApp],
          imports: [CommonModule],
          providers: [{provide: ErrorHandler, useClass: RethrowErrorHandler}],
        });
        const fixture = TestBed.createComponent(EmbeddedViewApp);

        expect(() => fixture.componentInstance.cdr.checkNoChanges()).toThrowError(
          /ExpressionChangedAfterItHasBeenCheckedError: .+ Previous value: '.*undefined'. Current value: '.*true'/gi,
        );
      });

      it('should NOT call lifecycle hooks', () => {
        TestBed.configureTestingModule({
          declarations: [AppComp, NoChangesComp],
          providers: [{provide: ErrorHandler, useClass: RethrowErrorHandler}],
        });

        const fixture = TestBed.createComponent(AppComp);
        fixture.detectChanges();

        expect(comp.doCheckCount).toEqual(1);
        expect(comp.contentCheckCount).toEqual(1);
        expect(comp.viewCheckCount).toEqual(1);

        comp.value = 2;
        expect(() => fixture.componentInstance.cdr.checkNoChanges()).toThrow();
        expect(comp.doCheckCount).toEqual(1);
        expect(comp.contentCheckCount).toEqual(1);
        expect(comp.viewCheckCount).toEqual(1);
      });

      describe('provideExperimentalCheckNoChangesForDebug', () => {
        // Needed because tests in this repo patch rAF to be setTimeout
        // and coalescing tries to get the native one but fails so
        // coalescing will run a timeout in the zone and cause an infinite loop.
        const previousRaf = global.requestAnimationFrame;
        beforeEach(() => {
          (global as any).requestAnimationFrame = undefined;
        });
        afterEach(() => {
          (global as any).requestAnimationFrame = previousRaf;
        });

        @Component({
          changeDetection: ChangeDetectionStrategy.OnPush,
          template: '{{state}}{{resolveReadPromise()}}',
        })
        class MyApp {
          state = 'initial';
          promise?: Promise<void>;
          private resolve?: Function;
          changeDetectorRef = inject(ChangeDetectorRef);
          createReadPromise() {
            this.promise = new Promise<void>((resolve) => {
              this.resolve = resolve;
            });
          }
          resolveReadPromise() {
            this.resolve?.();
          }
        }

        it('throws expression changed with interval', async () => {
          let error: RuntimeError | undefined = undefined;
          TestBed.configureTestingModule({
            providers: [
              provideZonelessChangeDetection(),
              provideCheckNoChangesConfig({interval: 5, exhaustive: true}),
              {
                provide: ErrorHandler,
                useValue: {
                  handleError(e: unknown) {
                    error = e as RuntimeError;
                  },
                },
              },
            ],
          });

          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();

          fixture.componentInstance.state = 'new';
          await new Promise<void>((resolve) => setTimeout(resolve, 10));

          expect(error!.code).toEqual(RuntimeErrorCode.EXPRESSION_CHANGED_AFTER_CHECKED);
        });

        it('does not throw expression changed with interval if change detection is scheduled', async () => {
          let error: RuntimeError | undefined = undefined;
          TestBed.configureTestingModule({
            providers: [
              provideZonelessChangeDetection(),
              provideCheckNoChangesConfig({interval: 0, exhaustive: true}),
              {
                provide: ErrorHandler,
                useValue: {
                  handleError(e: unknown) {
                    error = e as RuntimeError;
                  },
                },
              },
            ],
          });

          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();

          fixture.componentInstance.state = 'new';
          // markForCheck schedules change detection
          fixture.componentInstance.changeDetectorRef.markForCheck();
          // wait beyond the exhaustive check interval
          await new Promise<void>((resolve) => setTimeout(resolve, 1));

          expect(error).toBeUndefined();
        });

        it('throws expression changed OnPush components', () => {
          TestBed.configureTestingModule({
            providers: [provideCheckNoChangesConfig({exhaustive: true})],
          });

          @Component({
            template: '{{state}}',
            changeDetection: ChangeDetectionStrategy.OnPush,
          })
          class NotUnidirectionalDataFlow {
            state = 1;
            ngAfterViewChecked() {
              this.state++;
            }
          }
          expect(() =>
            TestBed.createComponent(NotUnidirectionalDataFlow).detectChanges(),
          ).toThrowError(/.*ExpressionChanged.*/);
        });
      });
    });
  });

  describe('OnPush markForCheck in lifecycle hooks', () => {
    describe('with check no changes enabled', () => createOnPushMarkForCheckTests(true));
    describe('with check no changes disabled', () => createOnPushMarkForCheckTests(false));

    function createOnPushMarkForCheckTests(checkNoChanges: boolean) {
      const detectChanges = (f: ComponentFixture<any>) => f.detectChanges(checkNoChanges);

      // 1. ngAfterViewInit and ngAfterViewChecked lifecycle hooks run after "OnPushComp" has
      //    been refreshed. They can mark the component as dirty. Meaning that the "OnPushComp"
      //    can be checked/refreshed in a subsequent change detection cycle.
      // 2. ngDoCheck and ngAfterContentChecked lifecycle hooks run before "OnPushComp" is
      //    refreshed. This means that those hooks cannot leave the component as dirty because
      //    the dirty state is reset afterwards. Though these hooks run every change detection
      //    cycle before "OnPushComp" is considered for refreshing. Hence marking as dirty from
      //    within such a hook can cause the component to checked/refreshed as intended.
      ['ngAfterViewInit', 'ngAfterViewChecked', 'ngAfterContentChecked', 'ngDoCheck'].forEach(
        (hookName) => {
          it(`should be able to mark component as dirty from within ${hookName}`, () => {
            @Component({
              selector: 'on-push-comp',
              changeDetection: ChangeDetectionStrategy.OnPush,
              template: `<p>{{text}}</p>`,
              standalone: false,
            })
            class OnPushComp {
              text = 'initial';

              constructor(private _cdRef: ChangeDetectorRef) {}

              [hookName]() {
                this._cdRef.markForCheck();
              }
            }

            @Component({
              template: `<on-push-comp></on-push-comp>`,
              standalone: false,
            })
            class TestApp {
              @ViewChild(OnPushComp) onPushComp!: OnPushComp;
            }

            TestBed.configureTestingModule({
              declarations: [TestApp, OnPushComp],
              imports: [CommonModule],
            });
            const fixture = TestBed.createComponent(TestApp);
            const pElement = fixture.nativeElement.querySelector('p') as HTMLElement;

            detectChanges(fixture);
            expect(pElement.textContent).toBe('initial');

            // "OnPushComp" component should be re-checked since it has been left dirty
            // in the first change detection (through the lifecycle hook). Hence, setting
            // a programmatic value and triggering a new change detection cycle should cause
            // the text to be updated in the view.
            fixture.componentInstance.onPushComp.text = 'new';
            detectChanges(fixture);
            expect(pElement.textContent).toBe('new');
          });
        },
      );

      // ngOnInit and ngAfterContentInit lifecycle hooks run once before "OnPushComp" is
      // refreshed/checked. This means they cannot mark the component as dirty because the
      // component dirty state will immediately reset after these hooks complete.
      ['ngOnInit', 'ngAfterContentInit'].forEach((hookName) => {
        it(`should not be able to mark component as dirty from within ${hookName}`, () => {
          @Component({
            selector: 'on-push-comp',
            changeDetection: ChangeDetectionStrategy.OnPush,
            template: `<p>{{text}}</p>`,
            standalone: false,
          })
          class OnPushComp {
            text = 'initial';

            constructor(private _cdRef: ChangeDetectorRef) {}

            [hookName]() {
              this._cdRef.markForCheck();
            }
          }

          @Component({
            template: `<on-push-comp></on-push-comp>`,
            standalone: false,
          })
          class TestApp {
            @ViewChild(OnPushComp) onPushComp!: OnPushComp;
          }

          TestBed.configureTestingModule({
            declarations: [TestApp, OnPushComp],
            imports: [CommonModule],
          });
          const fixture = TestBed.createComponent(TestApp);
          const pElement = fixture.nativeElement.querySelector('p') as HTMLElement;

          detectChanges(fixture);
          expect(pElement.textContent).toBe('initial');

          fixture.componentInstance.onPushComp.text = 'new';
          // this is a noop since the "OnPushComp" component is not marked as dirty. The
          // programmatically updated value will not be reflected in the rendered view.
          detectChanges(fixture);
          expect(pElement.textContent).toBe('initial');
        });
      });
    }
  });

  describe('ExpressionChangedAfterItHasBeenCheckedError', () => {
    @Component({
      template: '...',
      standalone: false,
    })
    class MyApp {
      a: string = 'a';
      b: string = 'b';
      c: string = 'c';
      unstableBooleanExpression: boolean = true;
      unstableStringExpression: string = 'initial';
      unstableColorExpression: string = 'red';
      unstableStyleMapExpression: {[key: string]: string} = {'color': 'red', 'margin': '10px'};
      unstableClassMapExpression: {[key: string]: boolean} = {'classA': true, 'classB': false};

      ngAfterViewChecked() {
        this.unstableBooleanExpression = false;
        this.unstableStringExpression = 'changed';
        this.unstableColorExpression = 'green';
        this.unstableStyleMapExpression = {'color': 'green', 'margin': '20px'};
        this.unstableClassMapExpression = {'classA': false, 'classB': true};
      }
    }

    function initComponent(overrides: {[key: string]: any}): ComponentFixture<MyApp> {
      TestBed.configureTestingModule({declarations: [MyApp]});
      TestBed.overrideComponent(MyApp, {set: overrides});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      return fixture;
    }

    function initWithTemplate(template: string) {
      return initComponent({template});
    }
    function initWithHostBindings(bindings: {[key: string]: string}) {
      return initComponent({host: bindings});
    }

    it('should include field name in case of property binding', () => {
      const message = `Previous value for 'id': 'initial'. Current value: 'changed'`;
      expect(() => initWithTemplate('<div [id]="unstableStringExpression"></div>')).toThrowError(
        new RegExp(message),
      );
    });

    it('should include field name in case of property interpolation', () => {
      const message = `Previous value for 'id': 'Expressions: a and initial!'. Current value: 'Expressions: a and changed!'`;
      expect(() =>
        initWithTemplate(
          '<div id="Expressions: {{ a }} and {{ unstableStringExpression }}!"></div>',
        ),
      ).toThrowError(new RegExp(message));
    });

    it('should include field name in case of attribute binding', () => {
      const message = `Previous value for 'attr.id': 'initial'. Current value: 'changed'`;
      expect(() =>
        initWithTemplate('<div [attr.id]="unstableStringExpression"></div>'),
      ).toThrowError(new RegExp(message));
    });

    xit('should include field name in case of attribute interpolation', () => {
      const message = `Previous value for 'attr.id': 'Expressions: a and initial!'. Current value: 'Expressions: a and changed!'`;
      expect(() =>
        initWithTemplate(
          '<div attr.id="Expressions: {{ a }} and {{ unstableStringExpression }}!"></div>',
        ),
      ).toThrowError(new RegExp(message));
    });

    it('should only display a value of an expression that was changed in text interpolation', () => {
      expect(() =>
        initWithTemplate('Expressions: {{ a }} and {{ unstableStringExpression }}!'),
      ).toThrowError(/Previous value: '.*?initial'. Current value: '.*?changed'/);
    });

    it(
      'should only display a value of an expression that was changed in text interpolation ' +
        'that follows an element with property interpolation',
      () => {
        expect(() => {
          initWithTemplate(`
             <div id="Prop interpolation: {{ aVal }}"></div>
             Text interpolation: {{ unstableStringExpression }}.
           `);
        }).toThrowError(/Previous value: '.*?initial'. Current value: '.*?changed'/);
      },
    );

    it('should include style prop name in case of style binding', () => {
      const message = `Previous value for 'color': 'red'. Current value: 'green'`;
      expect(() =>
        initWithTemplate('<div [style.color]="unstableColorExpression"></div>'),
      ).toThrowError(new RegExp(message));
    });

    it('should include class name in case of class binding', () => {
      const message = `Previous value for 'someClass': 'true'. Current value: 'false'`;
      expect(() =>
        initWithTemplate('<div [class.someClass]="unstableBooleanExpression"></div>'),
      ).toThrowError(new RegExp(message));
    });

    it('should only display a value of an expression that was changed in text interpolation inside i18n block', () => {
      expect(() =>
        initWithTemplate('<div i18n>Expression: {{ unstableStringExpression }}</div>'),
      ).toThrowError(/Previous value: '.*?initial'. Current value: '.*?changed'/);
    });

    it('should only display a value of an expression for interpolation inside an i18n property', () => {
      expect(() =>
        initWithTemplate(
          '<div i18n-title title="Expression: {{ unstableStringExpression }}"></div>',
        ),
      ).toThrowError(/Previous value: '.*?initial'. Current value: '.*?changed'/);
    });

    it('should include field name in case of host property binding', () => {
      const message = `Previous value for 'id': 'initial'. Current value: 'changed'`;
      expect(() => initWithHostBindings({'[id]': 'unstableStringExpression'})).toThrowError(
        new RegExp(message),
      );
    });

    it('should include style prop name in case of host style bindings', () => {
      const message = `Previous value for 'color': 'red'. Current value: 'green'`;
      expect(() => initWithHostBindings({'[style.color]': 'unstableColorExpression'})).toThrowError(
        new RegExp(message),
      );
    });

    it('should include class name in case of host class bindings', () => {
      const message = `Previous value for 'someClass': 'true'. Current value: 'false'`;
      expect(() =>
        initWithHostBindings({'[class.someClass]': 'unstableBooleanExpression'}),
      ).toThrowError(new RegExp(message));
    });

    // Note: the tests below currently fail in Ivy, but not in VE. VE behavior is correct and Ivy's
    // logic should be fixed by the upcoming styling refactor, we keep these tests to verify that.
    //
    // it('should not throw for style maps', () => {
    //  expect(() => initWithTemplate('<div [style]="unstableStyleMapExpression"></div>'))
    //      .not.toThrowError();
    // });
    //
    // it('should not throw for class maps', () => {
    //   expect(() => initWithTemplate('<div [class]="unstableClassMapExpression"></div>'))
    //       .not.toThrowError();
    // });
    //
    // it('should not throw for style maps as host bindings', () => {
    //   expect(() => initWithHostBindings({'[style]': 'unstableStyleMapExpression'}))
    //       .not.toThrowError();
    // });
    //
    // it('should not throw for class maps as host binding', () => {
    //   expect(() => initWithHostBindings({'[class]': 'unstableClassMapExpression'}))
    //       .not.toThrowError();
    // });
  });
});
