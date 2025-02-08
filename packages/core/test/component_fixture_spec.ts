/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  Component,
  EnvironmentInjector,
  ErrorHandler,
  Injectable,
  Input,
  NgZone,
  createComponent,
  provideExperimentalZonelessChangeDetection,
  signal,
} from '@angular/core';
import {
  ComponentFixtureAutoDetect,
  ComponentFixtureNoNgZone,
  TestBed,
  waitForAsync,
  withModule,
} from '@angular/core/testing';
import {dispatchEvent} from '@angular/platform-browser/testing/src/browser_util';
import {expect} from '@angular/platform-browser/testing/src/matchers';

@Component({
  selector: 'simple-comp',
  template: `<span>Original {{simpleBinding}}</span>`,
  standalone: false,
})
@Injectable()
class SimpleComp {
  simpleBinding: string;
  constructor() {
    this.simpleBinding = 'Simple';
  }
}

@Component({
  selector: 'deferred-comp',
  standalone: true,
  template: `<div>Deferred Component</div>`,
})
class DeferredComp {}

@Component({
  selector: 'second-deferred-comp',
  standalone: true,
  template: `<div>More Deferred Component</div>`,
})
class SecondDeferredComp {}

@Component({
  selector: 'my-if-comp',
  template: `MyIf(<span *ngIf="showMore">More</span>)`,
  standalone: false,
})
@Injectable()
class MyIfComp {
  showMore: boolean = false;
}

@Component({
  selector: 'autodetect-comp',
  template: `<span (click)='click()'>{{text}}</span>`,
  standalone: false,
})
class AutoDetectComp {
  text: string = '1';

  click() {
    this.text += '1';
  }
}

@Component({
  selector: 'async-comp',
  template: `<span (click)='click()'>{{text}}</span>`,
  standalone: false,
})
class AsyncComp {
  text: string = '1';

  click() {
    Promise.resolve(null).then((_) => {
      this.text += '1';
    });
  }
}

@Component({
  selector: 'async-child-comp',
  template: '<span>{{localText}}</span>',
  standalone: false,
})
class AsyncChildComp {
  localText: string = '';

  @Input()
  set text(value: string) {
    Promise.resolve(null).then((_) => {
      this.localText = value;
    });
  }
}

@Component({
  selector: 'async-change-comp',
  template: `<async-child-comp (click)='click()' [text]="text"></async-child-comp>`,
  standalone: false,
})
class AsyncChangeComp {
  text: string = '1';

  click() {
    this.text += '1';
  }
}

@Component({
  selector: 'async-timeout-comp',
  template: `<span (click)='click()'>{{text}}</span>`,
  standalone: false,
})
class AsyncTimeoutComp {
  text: string = '1';

  click() {
    setTimeout(() => {
      this.text += '1';
    }, 10);
  }
}

@Component({
  selector: 'nested-async-timeout-comp',
  template: `<span (click)='click()'>{{text}}</span>`,
  standalone: false,
})
class NestedAsyncTimeoutComp {
  text: string = '1';

  click() {
    setTimeout(() => {
      setTimeout(() => {
        this.text += '1';
      }, 10);
    }, 10);
  }
}

describe('ComponentFixture', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AutoDetectComp,
        AsyncComp,
        AsyncTimeoutComp,
        NestedAsyncTimeoutComp,
        AsyncChangeComp,
        MyIfComp,
        SimpleComp,
        AsyncChildComp,
      ],
    });
  }));

  it('should auto detect changes if autoDetectChanges is called', () => {
    const componentFixture = TestBed.createComponent(AutoDetectComp);
    expect(componentFixture.ngZone).not.toBeNull();
    componentFixture.autoDetectChanges();
    expect(componentFixture.nativeElement).toHaveText('1');

    const element = componentFixture.debugElement.children[0];
    dispatchEvent(element.nativeElement, 'click');

    expect(componentFixture.nativeElement).toHaveText('11');
  });

  it(
    'should auto detect changes if ComponentFixtureAutoDetect is provided as true',
    withModule({providers: [{provide: ComponentFixtureAutoDetect, useValue: true}]}, () => {
      const componentFixture = TestBed.createComponent(AutoDetectComp);
      expect(componentFixture.nativeElement).toHaveText('1');

      const element = componentFixture.debugElement.children[0];
      dispatchEvent(element.nativeElement, 'click');

      expect(componentFixture.nativeElement).toHaveText('11');
    }),
  );

  it('should signal through whenStable when the fixture is stable (autoDetectChanges)', waitForAsync(() => {
    const componentFixture = TestBed.createComponent(AsyncComp);
    componentFixture.autoDetectChanges();
    expect(componentFixture.nativeElement).toHaveText('1');

    const element = componentFixture.debugElement.children[0];
    dispatchEvent(element.nativeElement, 'click');
    expect(componentFixture.nativeElement).toHaveText('1');

    // Component is updated asynchronously. Wait for the fixture to become stable
    // before checking for new value.
    expect(componentFixture.isStable()).toBe(false);
    componentFixture.whenStable().then((waited) => {
      expect(waited).toBe(true);
      expect(componentFixture.nativeElement).toHaveText('11');
    });
  }));

  it('should signal through isStable when the fixture is stable (no autoDetectChanges)', waitForAsync(() => {
    const componentFixture = TestBed.createComponent(AsyncComp);

    componentFixture.detectChanges();
    expect(componentFixture.nativeElement).toHaveText('1');

    const element = componentFixture.debugElement.children[0];
    dispatchEvent(element.nativeElement, 'click');
    expect(componentFixture.nativeElement).toHaveText('1');

    // Component is updated asynchronously. Wait for the fixture to become stable
    // before checking.
    componentFixture.whenStable().then((waited) => {
      expect(waited).toBe(true);
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('11');
    });
  }));

  it(
    'should wait for macroTask(setTimeout) while checking for whenStable ' + '(autoDetectChanges)',
    waitForAsync(() => {
      const componentFixture = TestBed.createComponent(AsyncTimeoutComp);
      componentFixture.autoDetectChanges();
      expect(componentFixture.nativeElement).toHaveText('1');

      const element = componentFixture.debugElement.children[0];
      dispatchEvent(element.nativeElement, 'click');
      expect(componentFixture.nativeElement).toHaveText('1');

      // Component is updated asynchronously. Wait for the fixture to become
      // stable before checking for new value.
      expect(componentFixture.isStable()).toBe(false);
      componentFixture.whenStable().then((waited) => {
        expect(waited).toBe(true);
        expect(componentFixture.nativeElement).toHaveText('11');
      });
    }),
  );

  it(
    'should wait for macroTask(setTimeout) while checking for whenStable ' +
      '(no autoDetectChanges)',
    waitForAsync(() => {
      const componentFixture = TestBed.createComponent(AsyncTimeoutComp);
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('1');

      const element = componentFixture.debugElement.children[0];
      dispatchEvent(element.nativeElement, 'click');
      expect(componentFixture.nativeElement).toHaveText('1');

      // Component is updated asynchronously. Wait for the fixture to become
      // stable before checking for new value.
      expect(componentFixture.isStable()).toBe(false);
      componentFixture.whenStable().then((waited) => {
        expect(waited).toBe(true);
        componentFixture.detectChanges();
        expect(componentFixture.nativeElement).toHaveText('11');
      });
    }),
  );

  it(
    'should wait for nested macroTasks(setTimeout) while checking for whenStable ' +
      '(autoDetectChanges)',
    waitForAsync(() => {
      const componentFixture = TestBed.createComponent(NestedAsyncTimeoutComp);

      componentFixture.autoDetectChanges();
      expect(componentFixture.nativeElement).toHaveText('1');

      const element = componentFixture.debugElement.children[0];
      dispatchEvent(element.nativeElement, 'click');
      expect(componentFixture.nativeElement).toHaveText('1');

      // Component is updated asynchronously. Wait for the fixture to become
      // stable before checking for new value.
      expect(componentFixture.isStable()).toBe(false);
      componentFixture.whenStable().then((waited) => {
        expect(waited).toBe(true);
        expect(componentFixture.nativeElement).toHaveText('11');
      });
    }),
  );

  it(
    'should wait for nested macroTasks(setTimeout) while checking for whenStable ' +
      '(no autoDetectChanges)',
    waitForAsync(() => {
      const componentFixture = TestBed.createComponent(NestedAsyncTimeoutComp);
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('1');

      const element = componentFixture.debugElement.children[0];
      dispatchEvent(element.nativeElement, 'click');
      expect(componentFixture.nativeElement).toHaveText('1');

      // Component is updated asynchronously. Wait for the fixture to become
      // stable before checking for new value.
      expect(componentFixture.isStable()).toBe(false);
      componentFixture.whenStable().then((waited) => {
        expect(waited).toBe(true);
        componentFixture.detectChanges();
        expect(componentFixture.nativeElement).toHaveText('11');
      });
    }),
  );

  it('should stabilize after async task in change detection (autoDetectChanges)', waitForAsync(() => {
    const componentFixture = TestBed.createComponent(AsyncChangeComp);

    componentFixture.autoDetectChanges();
    componentFixture.whenStable().then((_) => {
      expect(componentFixture.nativeElement).toHaveText('1');

      const element = componentFixture.debugElement.children[0];
      dispatchEvent(element.nativeElement, 'click');

      componentFixture.whenStable().then((_) => {
        expect(componentFixture.nativeElement).toHaveText('11');
      });
    });
  }));

  it('should stabilize after async task in change detection(no autoDetectChanges)', waitForAsync(() => {
    const componentFixture = TestBed.createComponent(AsyncChangeComp);
    componentFixture.detectChanges();
    componentFixture.whenStable().then((_) => {
      // Run detectChanges again so that stabilized value is reflected in the
      // DOM.
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('1');

      const element = componentFixture.debugElement.children[0];
      dispatchEvent(element.nativeElement, 'click');
      componentFixture.detectChanges();

      componentFixture.whenStable().then((_) => {
        // Run detectChanges again so that stabilized value is reflected in
        // the DOM.
        componentFixture.detectChanges();
        expect(componentFixture.nativeElement).toHaveText('11');
      });
    });
  }));

  it('throws errors that happen during detectChanges', () => {
    @Component({
      template: '',
      standalone: true,
    })
    class App {
      ngOnInit() {
        throw new Error();
      }
    }

    const fixture = TestBed.createComponent(App);
    expect(() => fixture.detectChanges()).toThrow();
  });

  describe('errors during ApplicationRef.tick', () => {
    @Component({
      template: '',
      standalone: true,
    })
    class ThrowingThing {
      ngOnInit() {
        throw new Error();
      }
    }
    @Component({
      template: '',
      standalone: true,
    })
    class Blank {}

    it('rejects whenStable promise when errors happen during appRef.tick', async () => {
      const fixture = TestBed.createComponent(Blank);
      const throwingThing = createComponent(ThrowingThing, {
        environmentInjector: TestBed.inject(EnvironmentInjector),
      });

      TestBed.inject(ApplicationRef).attachView(throwingThing.hostView);
      await expectAsync(fixture.whenStable()).toBeRejected();
    });

    it('can opt-out of rethrowing application errors and rejecting whenStable promises', async () => {
      TestBed.configureTestingModule({rethrowApplicationErrors: false});
      const fixture = TestBed.createComponent(Blank);
      const throwingThing = createComponent(ThrowingThing, {
        environmentInjector: TestBed.inject(EnvironmentInjector),
      });

      TestBed.inject(ApplicationRef).attachView(throwingThing.hostView);
      await expectAsync(fixture.whenStable()).toBeResolved();
    });
  });

  describe('defer', () => {
    it('should return all defer blocks in the component', async () => {
      @Component({
        selector: 'defer-comp',
        standalone: true,
        imports: [DeferredComp, SecondDeferredComp],
        template: `<div>
            @defer (on immediate) {
              <DeferredComp />
            }
            @defer (on idle) {
              <SecondDeferredComp />
            }
          </div>`,
      })
      class DeferComp {}

      const componentFixture = TestBed.createComponent(DeferComp);
      const deferBlocks = await componentFixture.getDeferBlocks();
      expect(deferBlocks.length).toBe(2);
    });
  });

  describe('No NgZone', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{provide: ComponentFixtureNoNgZone, useValue: true}],
      });
    });

    it('calling autoDetectChanges raises an error', () => {
      const componentFixture = TestBed.createComponent(SimpleComp);
      expect(() => {
        componentFixture.autoDetectChanges();
      }).toThrowError(/Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set/);
    });

    it('should instantiate a component with valid DOM', waitForAsync(() => {
      const componentFixture = TestBed.createComponent(SimpleComp);

      expect(componentFixture.ngZone).toBeNull();
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('Original Simple');
    }));

    it('should allow changing members of the component', waitForAsync(() => {
      const componentFixture = TestBed.createComponent(MyIfComp);

      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('MyIf()');

      componentFixture.componentInstance.showMore = true;
      componentFixture.detectChanges();
      expect(componentFixture.nativeElement).toHaveText('MyIf(More)');
    }));

    it('throws errors that happen during detectChanges', () => {
      @Component({
        template: '',
        standalone: true,
      })
      class App {
        ngOnInit() {
          throw new Error();
        }
      }

      const fixture = TestBed.createComponent(App);
      expect(() => fixture.detectChanges()).toThrow();
    });
  });

  it('reports errors from autoDetect change detection to error handler', () => {
    let throwError = false;
    @Component({
      template: '',
      standalone: false,
    })
    class TestComponent {
      ngDoCheck() {
        if (throwError) {
          throw new Error();
        }
      }
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.autoDetectChanges();
    const errorHandler = TestBed.inject(ErrorHandler);
    const spy = spyOn(errorHandler, 'handleError').and.callThrough();

    throwError = true;
    TestBed.inject(NgZone).run(() => {});
    expect(spy).toHaveBeenCalled();
  });

  it('reports errors from checkNoChanges in autoDetect to error handler', () => {
    let throwError = false;
    @Component({
      template: '{{thing}}',
      standalone: false,
    })
    class TestComponent {
      thing = 'initial';
      ngAfterViewChecked() {
        if (throwError) {
          this.thing = 'new';
        }
      }
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.autoDetectChanges();
    const errorHandler = TestBed.inject(ErrorHandler);
    const spy = spyOn(errorHandler, 'handleError').and.callThrough();

    throwError = true;
    TestBed.inject(NgZone).run(() => {});
    expect(spy).toHaveBeenCalled();
  });
});

describe('ComponentFixture with zoneless', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        {provide: ErrorHandler, useValue: {handleError: () => {}}},
      ],
    });
  });

  it('will not refresh CheckAlways views when detectChanges is called if not marked dirty', () => {
    @Component({standalone: true, template: '{{signalThing()}}|{{regularThing}}'})
    class CheckAlwaysCmp {
      regularThing = 'initial';
      signalThing = signal('initial');
    }

    const fixture = TestBed.createComponent(CheckAlwaysCmp);
    // components are created dirty
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('initial|initial');
    fixture.componentInstance.regularThing = 'new';
    // Expression changed after checked
    expect(() => fixture.detectChanges()).toThrow();
    expect(fixture.nativeElement.innerText).toEqual('initial|initial');
    fixture.componentInstance.signalThing.set('new');
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('new|new');
  });

  it('throws errors that happen during detectChanges', () => {
    @Component({
      template: '',
      standalone: true,
    })
    class App {
      ngOnInit() {
        throw new Error();
      }
    }

    const fixture = TestBed.createComponent(App);
    expect(() => fixture.detectChanges()).toThrow();
  });

  it('rejects whenStable promise when errors happen during detectChanges', async () => {
    @Component({
      template: '',
      standalone: true,
    })
    class App {
      ngOnInit() {
        throw new Error();
      }
    }

    const fixture = TestBed.createComponent(App);
    await expectAsync(fixture.whenStable()).toBeRejected();
  });

  it('can disable checkNoChanges', () => {
    @Component({
      template: '{{thing}}',
      standalone: true,
    })
    class App {
      thing = 1;
      ngAfterViewChecked() {
        ++this.thing;
      }
    }

    const fixture = TestBed.createComponent(App);
    expect(() => fixture.detectChanges(false /*checkNoChanges*/)).not.toThrow();
    // still throws if checkNoChanges is not disabled
    expect(() => fixture.detectChanges()).toThrowError(/ExpressionChanged/);
  });

  it('runs change detection when autoDetect is false', () => {
    @Component({
      template: '{{thing()}}',
      standalone: true,
    })
    class App {
      thing = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    fixture.autoDetectChanges(false);
    fixture.componentInstance.thing.set(2);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toBe('2');
  });
});
