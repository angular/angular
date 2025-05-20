/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID} from '@angular/common';
import {Component, PLATFORM_ID} from '../src/core';
import {PendingTasksInternal} from '../src/pending_tasks';
import {DeferBlockBehavior, DeferBlockState, TestBed} from '../testing';
import {expect} from '@angular/private/testing/matchers';

@Component({
  selector: 'second-deferred-comp',
  template: `<div class="more">More Deferred Component</div>`,
})
class SecondDeferredComp {}

const COMMON_PROVIDERS = [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}];

describe('DeferFixture', () => {
  it('should start in manual behavior mode', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          }
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
      teardown: {destroyAfterEach: true},
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const el = componentFixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.more').length).toBe(0);
  });

  it('should start in manual trigger mode by default', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          }
        </div>
        `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const el = componentFixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.more').length).toBe(0);
  });

  it('should defer load immediately on playthrough', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (when shouldLoad) {
            <second-deferred-comp />
          }
        </div>
      `,
    })
    class DeferComp {
      shouldLoad = false;
    }

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const el = componentFixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.more').length).toBe(0);

    componentFixture.componentInstance.shouldLoad = true;
    componentFixture.detectChanges();

    await componentFixture.whenStable(); // await loading of deps

    expect(el.querySelector('.more')).toBeDefined();
  });

  it('should not defer load immediately when set to manual', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (when shouldLoad) {
            <second-deferred-comp />
          }
        </div>
      `,
    })
    class DeferComp {
      shouldLoad = false;
    }

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const el = componentFixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.more').length).toBe(0);

    componentFixture.componentInstance.shouldLoad = true;
    componentFixture.detectChanges();

    await componentFixture.whenStable(); // await loading of deps

    expect(el.querySelectorAll('.more').length).toBe(0);
  });

  it('should render a completed defer state', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          }
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];
    const el = componentFixture.nativeElement as HTMLElement;
    await deferBlock.render(DeferBlockState.Complete);
    expect(el.querySelector('.more')).toBeDefined();
  });

  it('should not wait forever if application is unstable for a long time', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          }
        </div>
      `,
    })
    class DeferComp {
      constructor(taskService: PendingTasksInternal) {
        // Add a task and never remove it. Keeps application unstable forever
        taskService.add();
      }
    }

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];
    const el = componentFixture.nativeElement as HTMLElement;
    await deferBlock.render(DeferBlockState.Complete);
    expect(el.querySelector('.more')).toBeDefined();
  });

  it('should work with templates that have local refs', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <ng-template #template>Hello</ng-template>
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          }
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];
    const el = componentFixture.nativeElement as HTMLElement;
    await deferBlock.render(DeferBlockState.Complete);
    expect(el.querySelector('.more')).toBeDefined();
  });

  it('should render a placeholder defer state', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          } @placeholder {
            <span class="ph">This is placeholder content</span>
          }
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];
    const el = componentFixture.nativeElement as HTMLElement;
    await deferBlock.render(DeferBlockState.Placeholder);
    expect(el.querySelectorAll('.more').length).toBe(0);
    const phContent = el.querySelector('.ph');
    expect(phContent).toBeDefined();
    expect(phContent?.innerHTML).toBe('This is placeholder content');
  });

  it('should render a loading defer state', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          } @loading {
            <span class="loading">Loading...</span>
          }w
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];
    const el = componentFixture.nativeElement as HTMLElement;
    await deferBlock.render(DeferBlockState.Loading);
    expect(el.querySelectorAll('.more').length).toBe(0);
    const loadingContent = el.querySelector('.loading');
    expect(loadingContent).toBeDefined();
    expect(loadingContent?.innerHTML).toBe('Loading...');
  });

  it('should render an error defer state', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          } @error {
            <span class="error">Flagrant Error!</span>
          }
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];
    const el = componentFixture.nativeElement as HTMLElement;
    await deferBlock.render(DeferBlockState.Error);
    expect(el.querySelectorAll('.more').length).toBe(0);
    const errContent = el.querySelector('.error');
    expect(errContent).toBeDefined();
    expect(errContent?.innerHTML).toBe('Flagrant Error!');
  });

  it('should throw when rendering a template that does not exist', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          }
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];
    try {
      await deferBlock.render(DeferBlockState.Placeholder);
    } catch (er: any) {
      expect(er.message).toBe(
        'Tried to render this defer block in the `Placeholder` state, but' +
          ' there was no @placeholder block defined in a template.',
      );
    }
  });

  it('should transition between states when `after` and `minimum` are used', async () => {
    @Component({
      selector: 'defer-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            Main content
          } @loading (after 1s) {
            Loading
          } @placeholder (minimum 2s) {
            Placeholder
          }
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];

    await deferBlock.render(DeferBlockState.Placeholder);
    expect(componentFixture.nativeElement.outerHTML).toContain('Placeholder');

    await deferBlock.render(DeferBlockState.Loading);
    expect(componentFixture.nativeElement.outerHTML).toContain('Loading');

    await deferBlock.render(DeferBlockState.Complete);
    expect(componentFixture.nativeElement.outerHTML).toContain('Main');
  });

  it('should get child defer blocks', async () => {
    @Component({
      selector: 'deferred-comp',
      imports: [SecondDeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <second-deferred-comp />
          }
        </div>
      `,
    })
    class DeferredComp {}

    @Component({
      selector: 'defer-comp',
      imports: [DeferredComp],
      template: `
        <div>
          @defer (on immediate) {
            <deferred-comp />
          }
        </div>
      `,
    })
    class DeferComp {}

    TestBed.configureTestingModule({
      imports: [DeferComp, DeferredComp, SecondDeferredComp],
      providers: COMMON_PROVIDERS,
    });

    const componentFixture = TestBed.createComponent(DeferComp);
    const deferBlock = (await componentFixture.getDeferBlocks())[0];
    await deferBlock.render(DeferBlockState.Complete);
    const fixtures = await deferBlock.getDeferBlocks();
    expect(fixtures.length).toBe(1);
  });
});
