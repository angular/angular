/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ProfilerEvent, setProfiler} from '@angular/core/src/render3/profiler';
import {TestBed} from '@angular/core/testing';
import {onlyInIvy} from '@angular/private/testing';

import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, DoCheck, ErrorHandler, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild} from '../../src/core';


onlyInIvy('Ivy-specific functionality').describe('profiler', () => {
  class Profiler {
    profile() {}
  }

  let profilerSpy: jasmine.Spy;

  beforeEach(() => {
    const profiler = new Profiler();
    profilerSpy = spyOn(profiler, 'profile').and.callThrough();
    setProfiler(profiler.profile);
  });

  afterAll(() => setProfiler(null));

  function findProfilerCall(condition: ProfilerEvent|((args: any[]) => boolean)) {
    let predicate: (args: any[]) => boolean = _ => true;
    if (typeof condition !== 'function') {
      predicate = (args: any[]) => args[0] === condition;
    } else {
      predicate = condition;
    }
    return profilerSpy.calls.all().map((call: any) => call.args).find(predicate);
  }

  describe('change detection hooks', () => {
    it('should call the profiler for creation and change detection', () => {
      @Component({selector: 'my-comp', template: '<button (click)="onClick()"></button>'})
      class MyComponent {
        onClick() {}
      }

      TestBed.configureTestingModule({declarations: [MyComponent]});
      const fixture = TestBed.createComponent(MyComponent);

      expect(profilerSpy).toHaveBeenCalled();

      const templateCreateStart = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.TemplateCreateStart &&
              args[1] === fixture.componentInstance);
      const templateCreateEnd = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.TemplateCreateEnd && args[1] === fixture.componentInstance);

      expect(templateCreateStart).toBeTruthy();
      expect(templateCreateEnd).toBeTruthy();

      fixture.detectChanges();

      const templateUpdateStart = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.TemplateUpdateStart &&
              args[1] === fixture.componentInstance);
      const templateUpdateEnd = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.TemplateUpdateEnd && args[1] === fixture.componentInstance);

      expect(templateUpdateStart).toBeTruthy();
      expect(templateUpdateEnd).toBeTruthy();
    });

    it('should invoke the profiler when the template throws', () => {
      @Component({selector: 'my-comp', template: '{{ throw() }}'})
      class MyComponent {
        throw() {
          throw new Error();
        }
      }

      TestBed.configureTestingModule({declarations: [MyComponent]});

      let myComp: MyComponent;
      expect(() => {
        const fixture = TestBed.createComponent(MyComponent);
        myComp = fixture.componentInstance;
        fixture.detectChanges();
      }).toThrow();

      expect(profilerSpy).toHaveBeenCalled();

      const templateCreateStart = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.TemplateCreateStart && args[1] === myComp);
      const templateCreateEnd = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.TemplateCreateEnd && args[1] === myComp);

      expect(templateCreateStart).toBeTruthy();
      expect(templateCreateEnd).toBeTruthy();
    });
  });

  describe('outputs and events', () => {
    it('should invoke the profiler on event handler', () => {
      @Component({selector: 'my-comp', template: '<button (click)="onClick()"></button>'})
      class MyComponent {
        onClick() {}
      }

      TestBed.configureTestingModule({declarations: [MyComponent]});
      const fixture = TestBed.createComponent(MyComponent);
      const myComp = fixture.componentInstance;

      const clickSpy = spyOn(myComp, 'onClick');
      const button = fixture.nativeElement.querySelector('button')!;

      button.click();

      expect(clickSpy).toHaveBeenCalled();

      const outputStart = findProfilerCall(ProfilerEvent.OutputStart);
      const outputEnd = findProfilerCall(ProfilerEvent.OutputEnd);

      expect(outputStart[1]).toEqual(myComp!);
      expect(outputEnd[1]).toEqual(myComp!);
    });

    it('should invoke the profiler on event handler even when it throws', () => {
      @Component({selector: 'my-comp', template: '<button (click)="onClick()"></button>'})
      class MyComponent {
        onClick() {
          throw new Error();
        }
      }

      const handler = new ErrorHandler();
      const errorSpy = spyOn(handler, 'handleError');

      TestBed.configureTestingModule(
          {declarations: [MyComponent], providers: [{provide: ErrorHandler, useValue: handler}]});

      const fixture = TestBed.createComponent(MyComponent);
      const myComp = fixture.componentInstance;
      const button = fixture.nativeElement.querySelector('button')!;

      button.click();

      expect(errorSpy).toHaveBeenCalled();

      const outputStart = findProfilerCall(ProfilerEvent.OutputStart);
      const outputEnd = findProfilerCall(ProfilerEvent.OutputEnd);

      expect(outputStart[1]).toEqual(myComp!);
      expect(outputEnd[1]).toEqual(myComp!);
    });

    it('should invoke the profiler on output handler execution', async () => {
      @Component({selector: 'child', template: ''})
      class Child {
        @Output() childEvent = new EventEmitter();
      }

      @Component({selector: 'my-comp', template: '<child (childEvent)="onEvent()"></child>'})
      class MyComponent {
        @ViewChild(Child) child!: Child;
        onEvent() {}
      }

      TestBed.configureTestingModule({declarations: [MyComponent, Child]});
      const fixture = TestBed.createComponent(MyComponent);
      const myComp = fixture.componentInstance;

      fixture.detectChanges();

      myComp.child!.childEvent.emit();

      const outputStart = findProfilerCall(ProfilerEvent.OutputStart);
      const outputEnd = findProfilerCall(ProfilerEvent.OutputEnd);

      expect(outputStart[1]).toEqual(myComp!);
      expect(outputEnd[1]).toEqual(myComp!);
    });
  });

  describe('lifecycle hooks', () => {
    it('should call the profiler on lifecycle execution', () => {
      class Service implements OnDestroy {
        ngOnDestroy() {}
      }
      @Component({selector: 'my-comp', template: '{{prop}}', providers: [Service]})
      class MyComponent implements OnInit, AfterViewInit, AfterViewChecked, AfterContentInit,
                                   AfterContentChecked, OnChanges, DoCheck, OnDestroy {
        @Input() prop = 1;

        constructor(private service: Service) {}

        ngOnInit() {}
        ngDoCheck() {}
        ngOnDestroy() {}
        ngOnChanges() {}
        ngAfterViewInit() {}
        ngAfterViewChecked() {}
        ngAfterContentInit() {}
        ngAfterContentChecked() {}
      }

      @Component({selector: 'my-parent', template: '<my-comp [prop]="prop"></my-comp>'})
      class MyParent {
        prop = 1;
        @ViewChild(MyComponent) child!: MyComponent;
      }

      TestBed.configureTestingModule({declarations: [MyParent, MyComponent]});
      const fixture = TestBed.createComponent(MyParent);

      fixture.detectChanges();

      const myParent = fixture.componentInstance;
      const myComp = fixture.componentInstance.child;

      const ngOnInitStart = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookStart && args[2] === myComp.ngOnInit);
      const ngOnInitEnd = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookEnd && args[2] === myComp.ngOnInit);

      expect(ngOnInitStart).toBeTruthy();
      expect(ngOnInitEnd).toBeTruthy();

      const ngOnDoCheckStart = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookStart && args[2] === myComp.ngDoCheck);
      const ngOnDoCheckEnd = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookEnd && args[2] === myComp.ngDoCheck);

      expect(ngOnDoCheckStart).toBeTruthy();
      expect(ngOnDoCheckEnd).toBeTruthy();

      const ngAfterViewInitStart = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookStart && args[2] === myComp.ngAfterViewInit);
      const ngAfterViewInitEnd = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookEnd && args[2] === myComp.ngAfterViewInit);

      expect(ngAfterViewInitStart).toBeTruthy();
      expect(ngAfterViewInitEnd).toBeTruthy();

      const ngAfterViewCheckedStart = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.LifecycleHookStart &&
              args[2] === myComp.ngAfterViewChecked);
      const ngAfterViewCheckedEnd = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookEnd && args[2] === myComp.ngAfterViewChecked);

      expect(ngAfterViewCheckedStart).toBeTruthy();
      expect(ngAfterViewCheckedEnd).toBeTruthy();

      const ngAfterContentInitStart = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.LifecycleHookStart &&
              args[2] === myComp.ngAfterContentInit);
      const ngAfterContentInitEnd = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookEnd && args[2] === myComp.ngAfterContentInit);

      expect(ngAfterContentInitStart).toBeTruthy();
      expect(ngAfterContentInitEnd).toBeTruthy();

      const ngAfterContentCheckedStart = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.LifecycleHookStart &&
              args[2] === myComp.ngAfterContentChecked);
      const ngAfterContentChecked = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.LifecycleHookEnd &&
              args[2] === myComp.ngAfterContentChecked);

      expect(ngAfterContentCheckedStart).toBeTruthy();
      expect(ngAfterContentChecked).toBeTruthy();


      // Verify we call `ngOnChanges` and the corresponding profiler hooks
      const onChangesSpy = spyOn(myComp, 'ngOnChanges');
      profilerSpy.calls.reset();

      myParent.prop = 2;
      fixture.detectChanges();

      const ngOnChangesStart = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.LifecycleHookStart && args[2] &&
              args[2].name && args[2].name.indexOf('OnChangesHook') >= 0);
      const ngOnChangesEnd = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.LifecycleHookEnd && args[2] && args[2].name &&
              args[2].name.indexOf('OnChangesHook') >= 0);

      expect(onChangesSpy).toHaveBeenCalled();
      expect(ngOnChangesStart).toBeTruthy();
      expect(ngOnChangesEnd).toBeTruthy();

      fixture.destroy();
      const ngOnDestroyStart = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookStart && args[2] === myComp.ngOnDestroy);
      const ngOnDestroyEnd = findProfilerCall(
          (args: any[]) =>
              args[0] === ProfilerEvent.LifecycleHookEnd && args[2] === myComp.ngOnDestroy);

      expect(ngOnDestroyStart).toBeTruthy();
      expect(ngOnDestroyEnd).toBeTruthy();

      const serviceNgOnDestroyStart = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.LifecycleHookStart &&
              args[2] === Service.prototype.ngOnDestroy);
      const serviceNgOnDestroyEnd = findProfilerCall(
          (args: any[]) => args[0] === ProfilerEvent.LifecycleHookEnd &&
              args[2] === Service.prototype.ngOnDestroy);

      expect(serviceNgOnDestroyStart).toBeTruthy();
      expect(serviceNgOnDestroyEnd).toBeTruthy();
    });
  });

  it('should call the profiler on lifecycle execution even after error', () => {
    @Component({selector: 'my-comp', template: ''})
    class MyComponent implements OnInit {
      ngOnInit() {
        throw new Error();
      }
    }

    TestBed.configureTestingModule({declarations: [MyComponent]});
    const fixture = TestBed.createComponent(MyComponent);

    expect(() => {
      fixture.detectChanges();
    }).toThrow();

    const lifecycleStart = findProfilerCall(ProfilerEvent.LifecycleHookStart);
    const lifecycleEnd = findProfilerCall(ProfilerEvent.LifecycleHookEnd);

    expect(lifecycleStart).toBeTruthy();
    expect(lifecycleEnd).toBeTruthy();
  });
});
