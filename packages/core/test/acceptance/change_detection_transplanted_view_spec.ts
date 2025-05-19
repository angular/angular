/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AsyncPipe, CommonModule, NgTemplateOutlet} from '@angular/common';
import {
  AfterViewChecked,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  createComponent,
  Directive,
  DoCheck,
  EmbeddedViewRef,
  EnvironmentInjector,
  ErrorHandler,
  inject,
  Input,
  signal,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {provideExperimentalCheckNoChangesForDebug} from '../../src/change_detection/scheduling/exhaustive_check_no_changes';
import {ComponentFixture, TestBed} from '../../testing';
import {expect} from '@angular/private/testing/matchers';
import {of} from 'rxjs';

describe('change detection for transplanted views', () => {
  describe('when declaration appears before insertion', () => {
    @Component({
      selector: 'onpush-insert-comp',
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        OnPushInsertComp({{greeting}})
        <div *ngIf="true">
          <!-- Add extra level of embedded view to ensure we can handle nesting -->
          <ng-container
              [ngTemplateOutlet]="template"
              [ngTemplateOutletContext]="{$implicit: greeting}">
          </ng-container>
        </div>
      `,
      standalone: false,
    })
    abstract class OnPushInsertComp implements DoCheck, AfterViewChecked {
      get template(): TemplateRef<any> {
        return templateRef;
      }
      greeting: string = 'Hello';
      constructor(public changeDetectorRef: ChangeDetectorRef) {
        onPushInsertComp = this;
      }
      ngDoCheck(): void {
        logValue = 'Insert';
      }
      ngAfterViewChecked(): void {
        logValue = null;
      }
    }

    @Directive({
      standalone: false,
    })
    abstract class DeclareComp implements DoCheck, AfterViewChecked {
      @ViewChild('myTmpl') myTmpl!: TemplateRef<any>;
      name: string = 'world';
      constructor(readonly changeDetector: ChangeDetectorRef) {}
      ngDoCheck(): void {
        logValue = 'Declare';
      }
      logName() {
        // This will log when the embedded view gets CD. The `logValue` will show if the CD was
        // from `Insert` or from `Declare` component.
        viewExecutionLog.push(logValue!);
        return this.name;
      }
      ngAfterViewChecked(): void {
        logValue = null;
      }
      ngAfterViewInit() {
        templateRef = this.myTmpl;
      }
    }

    @Component({
      selector: `check-always-declare-comp`,
      template: `
        DeclareComp({{name}})
        <ng-template #myTmpl let-greeting>
          {{greeting}} {{logName()}}!
        </ng-template>
      `,
      standalone: false,
    })
    class CheckAlwaysDeclareComp extends DeclareComp {
      constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
        declareComp = this;
      }
    }

    @Component({
      selector: `onpush-declare-comp`,
      template: `
        OnPushDeclareComp({{name}})
        <ng-template #myTmpl let-greeting>
          {{greeting}} {{logName()}}!
        </ng-template>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false,
    })
    class OnPushDeclareComp extends DeclareComp {
      constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
        onPushDeclareComp = this;
      }
    }

    @Component({
      selector: `signal-onpush-declare-comp`,
      template: `
        SignalOnPushDeclareComp({{name()}})
        <ng-template #myTmpl let-greeting>
          {{greeting}} {{surname()}}{{logExecutionContext()}}!
        </ng-template>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false,
    })
    class SignalOnPushDeclareComp {
      @ViewChild('myTmpl') myTmpl!: TemplateRef<any>;

      name = signal('world');
      templateName = signal('templateName');

      surname = computed(() => {
        const name = this.templateName();
        return name;
      });

      logExecutionContext() {
        viewExecutionLog.push(logValue);
        return '';
      }

      constructor() {
        signalDeclareComp = this;
      }

      ngAfterViewChecked() {
        logValue = null;
      }
      ngAfterViewInit() {
        templateRef = this.myTmpl;
      }
    }

    @Component({
      template: `
      <check-always-declare-comp *ngIf="showCheckAlwaysDeclare" />
      <onpush-declare-comp *ngIf="showOnPushDeclare" />
      <signal-onpush-declare-comp *ngIf="showSignalOnPushDeclare" />

      <onpush-insert-comp *ngIf="showOnPushInsert" />
      `,
      standalone: false,
    })
    class AppComp {
      showCheckAlwaysDeclare = false;
      showSignalOnPushDeclare = false;
      showOnPushDeclare = false;
      showOnPushInsert = false;
      constructor() {
        appComp = this;
      }
    }

    let viewExecutionLog!: Array<string | null>;
    let logValue!: string | null;
    let fixture!: ComponentFixture<AppComp>;
    let appComp!: AppComp;
    let onPushInsertComp!: OnPushInsertComp;
    let declareComp!: CheckAlwaysDeclareComp;
    let templateRef: TemplateRef<any>;
    let onPushDeclareComp!: OnPushDeclareComp;
    let signalDeclareComp!: SignalOnPushDeclareComp;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
          OnPushInsertComp,
          SignalOnPushDeclareComp,
          CheckAlwaysDeclareComp,
          OnPushDeclareComp,
          AppComp,
        ],
        imports: [CommonModule],
      });
      viewExecutionLog = [];
      fixture = TestBed.createComponent(AppComp);
    });

    describe('and declaration component is Onpush with signals and insertion is OnPush', () => {
      beforeEach(() => {
        fixture.componentInstance.showSignalOnPushDeclare = true;
        fixture.componentInstance.showOnPushInsert = true;
        fixture.detectChanges(false);
        viewExecutionLog.length = 0;
      });

      it('should set up the component under test correctly', () => {
        expect(viewExecutionLog.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'SignalOnPushDeclareComp(world) OnPushInsertComp(Hello) Hello templateName!',
        );
      });

      it('should CD at insertion and declaration', () => {
        signalDeclareComp.name.set('Angular');
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
          .withContext(
            'CD did not run on the transplanted template because it is inside an OnPush component and no signal changed',
          )
          .toEqual('SignalOnPushDeclareComp(Angular) OnPushInsertComp(Hello) Hello templateName!');

        onPushInsertComp.greeting = 'Hi';
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
          .withContext('Insertion component is OnPush.')
          .toEqual('SignalOnPushDeclareComp(Angular) OnPushInsertComp(Hello) Hello templateName!');

        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'SignalOnPushDeclareComp(Angular) OnPushInsertComp(Hi) Hi templateName!',
        );

        // Destroy insertion should also destroy declaration
        appComp.showOnPushInsert = false;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual('SignalOnPushDeclareComp(Angular)');

        // Restore both
        appComp.showOnPushInsert = true;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'SignalOnPushDeclareComp(Angular) OnPushInsertComp(Hello) Hello templateName!',
        );
      });
    });

    describe('and declaration component is CheckAlways', () => {
      beforeEach(() => {
        fixture.componentInstance.showCheckAlwaysDeclare = true;
        fixture.componentInstance.showOnPushInsert = true;
        fixture.detectChanges(false);
        viewExecutionLog.length = 0;
      });

      it('should set up the component under test correctly', () => {
        expect(viewExecutionLog.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'DeclareComp(world) OnPushInsertComp(Hello) Hello world!',
        );
      });

      it('should CD at insertion point only', () => {
        declareComp.name = 'Angular';
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'DeclareComp(Angular) OnPushInsertComp(Hello) Hello Angular!',
          'Expect transplanted LView to be CD because the declaration is CD.',
        );

        onPushInsertComp.greeting = 'Hi';
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'DeclareComp(Angular) OnPushInsertComp(Hello) Hello Angular!',
          'expect no change because it is on push.',
        );

        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'DeclareComp(Angular) OnPushInsertComp(Hi) Hi Angular!',
        );

        // Destroy insertion should also destroy declaration
        appComp.showOnPushInsert = false;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual('DeclareComp(Angular)');

        // Restore both
        appComp.showOnPushInsert = true;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'DeclareComp(Angular) OnPushInsertComp(Hello) Hello Angular!',
        );

        // Destroy declaration, But we should still be able to see updates in insertion
        appComp.showCheckAlwaysDeclare = false;
        onPushInsertComp.greeting = 'Hello';
        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'OnPushInsertComp(Hello) Hello Angular!',
        );
      });

      it('is not checked if detectChanges is called in declaration component', () => {
        declareComp.name = 'Angular';
        declareComp.changeDetector.detectChanges();
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'DeclareComp(Angular) OnPushInsertComp(Hello) Hello world!',
        );
      });

      it('is checked as part of CheckNoChanges pass', () => {
        fixture.detectChanges(true);
        expect(viewExecutionLog).toEqual([
          'Insert',
          null /* logName set to null afterViewChecked */,
        ]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'DeclareComp(world) OnPushInsertComp(Hello) Hello world!',
        );
      });
    });

    describe('and declaration and insertion components are OnPush', () => {
      beforeEach(() => {
        fixture.componentInstance.showOnPushDeclare = true;
        fixture.componentInstance.showOnPushInsert = true;
        fixture.detectChanges(false);
        viewExecutionLog.length = 0;
      });

      it('should set up component under test correctly', () => {
        expect(viewExecutionLog.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'OnPushDeclareComp(world) OnPushInsertComp(Hello) Hello world!',
        );
      });

      it('should not check anything when no views are dirty', () => {
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
      });

      it('should CD at insertion point only', () => {
        onPushDeclareComp.name = 'Angular';
        onPushInsertComp.greeting = 'Hi';
        // mark declaration point dirty
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'OnPushDeclareComp(Angular) OnPushInsertComp(Hello) Hello Angular!',
        );

        // mark insertion point dirty
        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'OnPushDeclareComp(Angular) OnPushInsertComp(Hi) Hi Angular!',
        );

        // mark both insertion and declaration point dirty
        onPushInsertComp.changeDetectorRef.markForCheck();
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
      });

      it('is checked if detectChanges is called in declaration component', () => {
        onPushDeclareComp.name = 'Angular';
        onPushDeclareComp.changeDetector.detectChanges();
        expect(trim(fixture.nativeElement.textContent)).toEqual(
          'OnPushDeclareComp(Angular) OnPushInsertComp(Hello) Hello world!',
        );
      });

      // TODO(FW-1774): blocked by https://github.com/angular/angular/pull/34443
      xit('is checked as part of CheckNoChanges pass', () => {
        // mark declaration point dirty
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([
          'Insert',
          null /* logName set to null in afterViewChecked */,
        ]);
        viewExecutionLog.length = 0;

        // mark insertion point dirty
        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert', null]);
        viewExecutionLog.length = 0;

        // mark both insertion and declaration point dirty
        onPushInsertComp.changeDetectorRef.markForCheck();
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert', null]);
        viewExecutionLog.length = 0;
      });

      it('does not cause infinite change detection if transplanted view is dirty and destroyed before refresh', () => {
        // mark declaration point dirty
        onPushDeclareComp.changeDetector.markForCheck();
        // detach insertion so the transplanted view doesn't get refreshed when CD runs
        onPushInsertComp.changeDetectorRef.detach();
        // run CD, which will set the `RefreshView` flag on the transplanted view
        fixture.detectChanges(false);
        // reattach insertion so the DESCENDANT_VIEWS counters update
        onPushInsertComp.changeDetectorRef.reattach();
        // make it so the insertion is destroyed before getting refreshed
        fixture.componentInstance.showOnPushInsert = false;
        // run CD again. If we didn't clear the flag/counters when destroying the view, this
        // would cause an infinite CD because the counters will be >1 but we will never reach a
        // view to refresh and decrement the counters.
        fixture.detectChanges(false);
      });
    });
  });

  describe('backwards references', () => {
    @Component({
      selector: 'insertion',
      template: `
            <div>Insertion({{name}})</div>
            <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{$implicit: name}">
            </ng-container>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false,
    })
    class Insertion {
      @Input() template!: TemplateRef<{}>;
      name = 'initial';
      constructor(readonly changeDetectorRef: ChangeDetectorRef) {}
    }

    @Component({
      selector: 'declaration',
      template: `
          <div>Declaration({{name}})</div>
          <ng-template #template let-contextName>
            <div>{{incrementChecks()}}</div>
            <div>TemplateDeclaration({{name}})</div>
            <div>TemplateContext({{contextName}})</div>
          </ng-template>
        `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false,
    })
    class Declaration {
      @ViewChild('template') template?: TemplateRef<{}>;
      name = 'initial';
      transplantedViewRefreshCount = 0;
      constructor(readonly changeDetectorRef: ChangeDetectorRef) {}
      incrementChecks() {
        this.transplantedViewRefreshCount++;
      }
    }
    let fixture: ComponentFixture<App>;
    let appComponent: App;

    @Component({
      template: `
        <insertion *ngIf="showInsertion" [template]="declaration?.template">
        </insertion>
        <declaration></declaration>
        `,
      standalone: false,
    })
    class App {
      @ViewChild(Declaration) declaration!: Declaration;
      @ViewChild(Insertion) insertion!: Insertion;
      template?: TemplateRef<{}>;
      showInsertion = false;
    }

    beforeEach(() => {
      fixture = TestBed.configureTestingModule({
        declarations: [App, Declaration, Insertion],
      }).createComponent(App);
      appComponent = fixture.componentInstance;
      fixture.detectChanges(false);
      appComponent.showInsertion = true;
      fixture.detectChanges(false);
      appComponent.declaration.transplantedViewRefreshCount = 0;
    });

    it('should set up component under test correctly', () => {
      expect(fixture.nativeElement.textContent).toEqual(
        'Insertion(initial)TemplateDeclaration(initial)TemplateContext(initial)Declaration(initial)',
      );
      expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(0);
    });

    it('should update declaration view when there is a change in the declaration and insertion is marked dirty', () => {
      appComponent.declaration.name = 'new name';
      appComponent.insertion.changeDetectorRef.markForCheck();
      fixture.detectChanges(false);
      expect(fixture.nativeElement.textContent).toEqual(
        'Insertion(initial)TemplateDeclaration(new name)TemplateContext(initial)Declaration(initial)',
        'Name should not update in declaration view because only insertion was marked dirty',
      );
      expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(1);
    });

    it('updates the declaration view when there is a change to either declaration or insertion', () => {
      appComponent.declaration.name = 'new name';
      appComponent.declaration.changeDetectorRef.markForCheck();
      fixture.detectChanges(false);

      const expectedContent =
        'Insertion(initial)TemplateDeclaration(new name)TemplateContext(initial)Declaration(new name)';
      expect(fixture.nativeElement.textContent).toEqual(expectedContent);
      expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(1);
    });

    it('should update when there is a change to insertion and declaration is marked dirty', () => {
      appComponent.insertion.name = 'new name';
      appComponent.declaration.changeDetectorRef.markForCheck();
      fixture.detectChanges(false);
      expect(fixture.nativeElement.textContent).toEqual(
        'Insertion(initial)TemplateDeclaration(initial)TemplateContext(initial)Declaration(initial)',
      );
      expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(1);
    });

    it('should update insertion view and template when there is a change to insertion and insertion marked dirty', () => {
      appComponent.insertion.name = 'new name';
      appComponent.insertion.changeDetectorRef.markForCheck();
      fixture.detectChanges(false);
      expect(fixture.nativeElement.textContent).toEqual(
        'Insertion(new name)TemplateDeclaration(initial)TemplateContext(new name)Declaration(initial)',
      );
      expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(1);
    });

    it('should not refresh the template if nothing is marked dirty', () => {
      fixture.detectChanges(false);
      expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(0);
    });

    it('should refresh template when declaration and insertion are marked dirty', () => {
      appComponent.declaration.changeDetectorRef.markForCheck();
      appComponent.insertion.changeDetectorRef.markForCheck();
      fixture.detectChanges(false);
      expect(appComponent.declaration.transplantedViewRefreshCount)
        .withContext(
          'Should refresh twice because insertion executes and then declaration marks transplanted view dirty again',
        )
        .toEqual(2);
    });
  });

  describe('transplanted views shielded by OnPush', () => {
    @Component({
      selector: 'check-always-insertion',
      template: `<ng-container [ngTemplateOutlet]="template"></ng-container>`,
      standalone: false,
    })
    class CheckAlwaysInsertion {
      @Input() template!: TemplateRef<{}>;
    }

    @Component({
      selector: 'on-push-insertion-host',
      template: `<check-always-insertion [template]="template"></check-always-insertion>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false,
    })
    class OnPushInsertionHost {
      @Input() template!: TemplateRef<{}>;
      constructor(readonly cdr: ChangeDetectorRef) {}
    }
    @Component({
      template: `
      <ng-template #template>{{value}}</ng-template>
      <on-push-insertion-host [template]="template"></on-push-insertion-host>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false,
    })
    class OnPushDeclaration {
      @ViewChild(OnPushInsertionHost) onPushInsertionHost?: OnPushInsertionHost;
      private _value = 'initial';
      throwErrorInView = false;
      get value() {
        if (this.throwErrorInView) {
          throw new Error('error getting value in transplanted view');
        }
        return this._value;
      }
      set value(v: string) {
        this._value = v;
      }

      constructor(readonly cdr: ChangeDetectorRef) {}
    }
    @Component({
      template: `
      <ng-template #template>{{value}}</ng-template>
      <on-push-insertion-host [template]="template"></on-push-insertion-host>
      `,
      standalone: false,
    })
    class CheckAlwaysDeclaration {
      @ViewChild(OnPushInsertionHost) onPushInsertionHost?: OnPushInsertionHost;
      value = 'initial';
    }

    function getFixture<T>(componentUnderTest: Type<T>): ComponentFixture<T> {
      return TestBed.configureTestingModule({
        declarations: [
          CheckAlwaysDeclaration,
          OnPushDeclaration,
          CheckAlwaysInsertion,
          OnPushInsertionHost,
        ],
      }).createComponent(componentUnderTest);
    }

    it('can recover from errors thrown during change detection', () => {
      const fixture = getFixture(OnPushDeclaration);
      fixture.detectChanges();
      fixture.componentInstance.value = 'new';
      fixture.componentInstance.cdr.markForCheck();
      fixture.componentInstance.throwErrorInView = true;
      expect(() => {
        fixture.detectChanges();
      }).toThrow();
      // Ensure that the transplanted view can still get refreshed if we rerun change detection
      // without the error
      fixture.componentInstance.throwErrorInView = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('new');
    });

    it('refresh when transplanted view is declared in CheckAlways component', () => {
      const fixture = getFixture(CheckAlwaysDeclaration);
      fixture.detectChanges();
      fixture.componentInstance.value = 'new';
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('new');
    });

    it('refresh when transplanted view is declared in OnPush component', () => {
      const fixture = getFixture(OnPushDeclaration);
      fixture.detectChanges();
      fixture.componentInstance.value = 'new';
      fixture.componentInstance.cdr.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('new');
    });

    describe('when insertion is detached', () => {
      it('does not refresh CheckAlways transplants', () => {
        const fixture = getFixture(CheckAlwaysDeclaration);
        fixture.detectChanges();
        fixture.componentInstance.onPushInsertionHost!.cdr.detach();
        fixture.componentInstance.value = 'new';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('initial');
      });

      it('does not refresh OnPush transplants', () => {
        const fixture = getFixture(OnPushDeclaration);
        fixture.detectChanges();
        fixture.componentInstance.onPushInsertionHost!.cdr.detach();
        fixture.componentInstance.value = 'new';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('initial');
      });
    });
  });

  it('refreshes transplanted views used as template in ngForTemplate', () => {
    @Component({
      selector: 'triple',
      template: '<div *ngFor="let unused of [1,2,3]; template: template"></div>',
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false,
    })
    class TripleTemplate {
      @Input() template!: TemplateRef<{}>;
    }

    @Component({
      template: `
        <ng-template #template>{{name}}</ng-template>
        <triple [template]="template"></triple>
      `,
      standalone: false,
    })
    class App {
      name = 'Penny';
    }

    const fixture = TestBed.configureTestingModule({
      declarations: [App, TripleTemplate],
    }).createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual('PennyPennyPenny');
    fixture.componentInstance.name = 'Sheldon';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual(
      'SheldonSheldonSheldon',
      'Expected transplanted view to be refreshed even when insertion is not dirty',
    );
  });

  describe('ViewRef and ViewContainerRef operations', () => {
    @Component({
      template: '<ng-template>{{incrementChecks()}}</ng-template>',
      standalone: false,
    })
    class AppComponent {
      @ViewChild(TemplateRef) templateRef!: TemplateRef<{}>;

      constructor(
        readonly rootViewContainerRef: ViewContainerRef,
        readonly cdr: ChangeDetectorRef,
      ) {}

      checks = 0;
      incrementChecks() {
        this.checks++;
      }
    }

    let fixture: ComponentFixture<AppComponent>;
    let component: AppComponent;
    let viewRef: EmbeddedViewRef<{}>;
    beforeEach(() => {
      fixture = TestBed.configureTestingModule({declarations: [AppComponent]}).createComponent(
        AppComponent,
      );
      component = fixture.componentInstance;
      fixture.detectChanges();
      viewRef = component.templateRef.createEmbeddedView({});
      component.rootViewContainerRef.insert(viewRef);
    });

    it('should not fail when change detecting detached transplanted view', () => {
      // This `ViewContainerRef` is for the root view
      // `detectChanges` on this `ChangeDetectorRef` will refresh this view and children, not the
      // root view that has the transplanted `viewRef` inserted.
      component.cdr.detectChanges();
      // The template should not have been refreshed because it was inserted "above" the component
      // so `detectChanges` will not refresh it.
      expect(component.checks).toEqual(0);

      // Detach view, manually call `detectChanges`, and verify the template was refreshed
      component.rootViewContainerRef.detach();
      viewRef.detectChanges();
      expect(component.checks).toEqual(1);
    });

    it('should work when change detecting detached transplanted view already marked for refresh', () => {
      // detach the viewRef only. This just removes the LViewFlags.Attached rather than actually
      // detaching the view from the container.
      viewRef.detach();
      // Calling detectChanges marks transplanted views for check
      component.cdr.detectChanges();
      expect(() => {
        // Calling detectChanges on the transplanted view itself will clear the refresh flag. It
        // _should not_ also attempt to update the parent counters because it's detached and
        // should not affect parent counters.
        viewRef.detectChanges();
      }).not.toThrow();
      expect(component.checks).toEqual(1);
    });

    it('should work when re-inserting a previously detached transplanted view marked for refresh', () => {
      // Test case for inserting a view with refresh flag
      viewRef.detach();
      // mark transplanted views for check but does not refresh transplanted view because it is
      // detached
      component.cdr.detectChanges();
      // reattach view itself
      viewRef.reattach();
      expect(() => {
        // detach and reattach view from ViewContainerRef
        component.rootViewContainerRef.detach();
        component.rootViewContainerRef.insert(viewRef);
        // calling detectChanges will clear the refresh flag. If the above operations messed up
        // the counter, this would fail when attempted to decrement.
        fixture.detectChanges(false);
      }).not.toThrow();
      // The transplanted view gets refreshed twice because it's actually inserted "backwards"
      // The view is defined in AppComponent but inserted in its ViewContainerRef (as an
      // embedded view in AppComponent's host view).
      expect(component.checks).toEqual(2);
    });

    it('should work when detaching an attached transplanted view with the refresh flag', () => {
      viewRef.detach();
      // mark transplanted views for check but does not refresh transplanted view because it is
      // detached
      component.cdr.detectChanges();
      // reattach view with refresh flag should increment parent counters
      viewRef.reattach();
      expect(() => {
        // detach view with refresh flag should decrement parent counters
        viewRef.detach();
        // detectChanges on parent should not cause infinite loop if the above counters were updated
        // correctly both times.
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should work when destroying a view with the refresh flag', () => {
      viewRef.detach();
      // mark transplanted views for check but does not refresh transplanted view because it is
      // detached
      component.cdr.detectChanges();
      viewRef.reattach();
      expect(() => {
        viewRef.destroy();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('when detached', () => {
    @Component({
      selector: 'on-push-component',
      template: `
          <ng-container #vc></ng-container>
        `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: false,
    })
    class OnPushComponent {
      @ViewChild('vc', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
      @Input() template!: TemplateRef<{}>;

      createTemplate() {
        return this.viewContainer.createEmbeddedView(this.template);
      }
    }

    @Component({
      selector: 'check-always-component',
      template: `
          <ng-container #vc></ng-container>
        `,
      standalone: false,
    })
    class CheckAlwaysComponent {
      @ViewChild('vc', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
      @Input() template!: TemplateRef<{}>;

      createTemplate() {
        return this.viewContainer.createEmbeddedView(this.template);
      }
    }
    let fixture: ComponentFixture<App>;
    let appComponent: App;
    let onPushComponent: OnPushComponent;
    let checkAlwaysComponent: CheckAlwaysComponent;

    @Component({
      template: `
      <ng-template #transplantedTemplate>{{ incrementChecks() }}</ng-template>
      <on-push-component [template]="transplantedTemplate"></on-push-component>
      <check-always-component [template]="transplantedTemplate"></check-always-component>
        `,
      standalone: false,
    })
    class App {
      @ViewChild(OnPushComponent) onPushComponent!: OnPushComponent;
      @ViewChild(CheckAlwaysComponent) checkAlwaysComponent!: CheckAlwaysComponent;
      transplantedViewRefreshCount = 0;
      incrementChecks() {
        this.transplantedViewRefreshCount++;
      }
    }
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [App, OnPushComponent, CheckAlwaysComponent]});
      fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      appComponent = fixture.componentInstance;
      onPushComponent = appComponent.onPushComponent;
      checkAlwaysComponent = appComponent.checkAlwaysComponent;
    });
    describe('inside OnPush components', () => {
      it('should detect changes when attached', () => {
        onPushComponent.createTemplate();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
      });

      it('should not detect changes', () => {
        const viewRef = onPushComponent.createTemplate();
        viewRef.detach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(0);
        viewRef.reattach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
      });

      it('should not detect changes on mixed detached/attached refs', () => {
        onPushComponent.createTemplate();
        const viewRef = onPushComponent.createTemplate();
        viewRef.detach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
        viewRef.reattach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(3);
      });
    });

    describe('inside CheckAlways component', () => {
      it('should detect changes when attached', () => {
        checkAlwaysComponent.createTemplate();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
      });

      it('should not detect changes', () => {
        const viewRef = checkAlwaysComponent.createTemplate();
        viewRef.detach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(0);
        viewRef.reattach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
      });

      it('should not detect changes on mixed detached/attached refs', () => {
        checkAlwaysComponent.createTemplate();
        const viewRef = checkAlwaysComponent.createTemplate();
        viewRef.detach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
        viewRef.reattach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(3);
      });
    });

    it('does not cause error if running change detection on detached view', () => {
      @Component({
        standalone: true,
        selector: 'insertion',
        template: `<ng-container #vc></ng-container>`,
      })
      class Insertion {
        @ViewChild('vc', {read: ViewContainerRef, static: true}) viewContainer!: ViewContainerRef;
        @Input() template!: TemplateRef<{}>;
        ngOnChanges() {
          return this.viewContainer.createEmbeddedView(this.template);
        }
      }

      @Component({
        standalone: true,
        template: `
          <ng-template #transplantedTemplate></ng-template>
          <insertion [template]="transplantedTemplate"></insertion>
        `,
        imports: [Insertion],
      })
      class Root {
        readonly cdr = inject(ChangeDetectorRef);
      }

      const fixture = TestBed.createComponent(Root);
      fixture.componentInstance.cdr.detach();
      fixture.componentInstance.cdr.detectChanges();
    });

    it('backwards reference still updated if detaching root during change detection', () => {
      @Component({
        standalone: true,
        selector: 'insertion',
        template: `<ng-container #vc></ng-container>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class Insertion {
        @ViewChild('vc', {read: ViewContainerRef, static: true}) viewContainer!: ViewContainerRef;
        @Input() template!: TemplateRef<{}>;
        ngOnChanges() {
          return this.viewContainer.createEmbeddedView(this.template);
        }
      }

      @Component({
        template: '<ng-template #template>{{value}}</ng-template>',
        selector: 'declaration',
        standalone: true,
      })
      class Declaration {
        @ViewChild('template', {static: true}) transplantedTemplate!: TemplateRef<{}>;
        @Input() value?: string;
      }

      @Component({
        standalone: true,
        template: `
          <insertion [template]="declaration?.transplantedTemplate"></insertion>
          <declaration [value]="value"></declaration>
          {{incrementChecks()}}
        `,
        imports: [Insertion, Declaration],
      })
      class Root {
        @ViewChild(Declaration, {static: true}) declaration!: Declaration;
        readonly cdr = inject(ChangeDetectorRef);
        value = 'initial';
        templateExecutions = 0;
        incrementChecks() {
          this.templateExecutions++;
        }
      }

      const fixture = TestBed.createComponent(Root);
      fixture.detectChanges(false);
      expect(fixture.nativeElement.innerText).toEqual('initial');
      expect(fixture.componentInstance.templateExecutions).toEqual(1);

      // Root is detached and value in transplanted view updates during CD. Because it is inserted
      // backwards, this requires a rerun of the traversal at the root. This test ensures we still
      // get the rerun even when the root is detached.
      fixture.componentInstance.cdr.detach();
      fixture.componentInstance.value = 'new';
      fixture.componentInstance.cdr.detectChanges();
      expect(fixture.componentInstance.templateExecutions).toEqual(2);
      expect(fixture.nativeElement.innerText).toEqual('new');
    });
  });

  it('can use AsyncPipe on new Observable in insertion tree when used as backwards reference', () => {
    @Component({
      selector: 'insertion',
      imports: [NgTemplateOutlet],
      standalone: true,
      template: ` <ng-container [ngTemplateOutlet]="template"> </ng-container>`,
    })
    class Insertion {
      @Input() template!: TemplateRef<{}>;
      constructor(readonly changeDetectorRef: ChangeDetectorRef) {}
    }

    @Component({
      imports: [Insertion, AsyncPipe],
      template: `<ng-template #myTmpl> {{newObservable() | async}} </ng-template>`,
      standalone: true,
      selector: 'declaration',
    })
    class Declaration {
      @ViewChild('myTmpl', {static: true}) template!: TemplateRef<{}>;
      newObservable() {
        return of('');
      }
    }
    @Component({
      standalone: true,
      imports: [Declaration, Insertion],
      template: '<insertion [template]="declaration.template"/><declaration #declaration/>',
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ErrorHandler,
          useClass: class extends ErrorHandler {
            override handleError(e: any) {
              throw e;
            }
          },
        },
      ],
    });

    const app = createComponent(App, {environmentInjector: TestBed.inject(EnvironmentInjector)});
    const appRef = TestBed.inject(ApplicationRef);
    appRef.attachView(app.hostView);
    // ApplicationRef has a loop to continue refreshing dirty views. If done incorrectly,
    // refreshing the backwards reference transplanted view can cause an infinite loop because it
    // goes and marks the root view dirty, which then starts the process all over again by
    // checking the declaration.
    expect(() => appRef.tick()).not.toThrow();
    app.destroy();
  });
  it('does not cause infinite loops with exhaustive checkNoChanges', async () => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalCheckNoChangesForDebug({interval: 1})],
    });
    const errorSpy = spyOn(console, 'error').and.callFake((...v) => {
      fail('console errored with ' + v);
    });
    @Component({
      standalone: true,
      selector: 'insertion',
      template: `<ng-container #vc></ng-container>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Insertion {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) viewContainer!: ViewContainerRef;
      @Input() template!: TemplateRef<{}>;
      ngOnChanges() {
        return this.viewContainer.createEmbeddedView(this.template);
      }
    }

    @Component({
      standalone: true,
      template: `
          <ng-template #template>hello world</ng-template>
          <insertion [template]="transplantedTemplate"></insertion>
        `,
      imports: [Insertion],
    })
    class Root {
      @ViewChild('template', {static: true}) transplantedTemplate!: TemplateRef<{}>;
    }

    const fixture = TestBed.createComponent(Root);
    TestBed.inject(ApplicationRef).attachView(fixture.componentRef.hostView);
    // wait the 1 tick for exhaustive check to trigger
    await new Promise((r) => setTimeout(r, 1));
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

function trim(text: string | null): string {
  return text ? text.replace(/[\s\n]+/gm, ' ').trim() : '';
}
