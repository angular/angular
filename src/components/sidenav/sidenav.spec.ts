import {
  it,
  describe,
  expect,
  beforeEach,
  fakeAsync,
  inject,
  injectAsync,
  tick
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {XHR} from '@angular/compiler';
import {
  Component,
  Type,
  ViewMetadata
} from '@angular/core';

import {By} from '@angular/platform-browser';
import {MdSidenav, MdSidenavLayout, MD_SIDENAV_DIRECTIVES} from './sidenav';


function fakeAsyncAdaptor(fn: () => void) {
  return inject([], fakeAsync(fn));
}


/**
 * Create a ComponentFixture from the builder. This takes a template and a style for sidenav.
 */
function createFixture(appType: Type, builder: TestComponentBuilder,
                       template: string, style: string): ComponentFixture<any> {
  let fixture: ComponentFixture<any> = null;
  // Remove the styles (which remove the animations/transitions).
  builder
    .overrideView(MdSidenavLayout, new ViewMetadata({
      template: template,
      styles: [style],
      directives: [MdSidenav],
    }))
    .createAsync(appType).then((f: ComponentFixture<any>) => {
    fixture = f;
  });
  tick();

  return fixture;
}


function endSidenavTransition(fixture: ComponentFixture<any>) {
  let sidenav: any = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;
  sidenav.onTransitionEnd({
    target: (<any>sidenav)._elementRef.nativeElement,
    propertyName: 'transform'
  });
  fixture.detectChanges();
}


describe('MdSidenav', () => {
  let template: string;
  let style: string;
  let builder: TestComponentBuilder;

  /**
   * We need to get the template and styles for the sidenav in an Async test.
   * FakeAsync would block indefinitely on the XHR if we were to create the component async-ly.
   * See https://github.com/angular/angular/issues/5601.
   * We do some style verification so styles have to match.
   * But we remove the transitions so we only set the regular `sidenav.css` styling.
   */
  beforeEach(injectAsync([TestComponentBuilder, XHR], (tcb: TestComponentBuilder, xhr: XHR) => {
    builder = tcb;

    return Promise.all([
      xhr.get('./components/sidenav/sidenav.html').then((t) => {
        template = t;
      }),
      xhr.get('./components/sidenav/sidenav.css').then((css) => {
        style = css;
      })
    ]).catch((err: any) => {
      console.error(err);
    });
  }));

  describe('methods', () => {
    it('should be able to open and close', fakeAsyncAdaptor(() => {
      let fixture = createFixture(BasicTestApp, builder, template, style);

      let testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      let openButtonElement = fixture.debugElement.query(By.css('.open'));
      openButtonElement.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.openStartCount).toBe(1);
      expect(testComponent.openCount).toBe(0);

      endSidenavTransition(fixture);
      tick();

      expect(testComponent.openStartCount).toBe(1);
      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeStartCount).toBe(0);
      expect(testComponent.closeCount).toBe(0);

      let sidenavElement = fixture.debugElement.query(By.css('md-sidenav'));
      let sidenavBackdropElement = fixture.debugElement.query(By.css('.md-sidenav-backdrop'));
      expect(getComputedStyle(sidenavElement.nativeElement).visibility).toEqual('visible');
      expect(getComputedStyle(sidenavBackdropElement.nativeElement).visibility)
        .toEqual('visible');

      // Close it.
      let closeButtonElement = fixture.debugElement.query(By.css('.close'));
      closeButtonElement.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.openStartCount).toBe(1);
      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeStartCount).toBe(1);
      expect(testComponent.closeCount).toBe(0);

      endSidenavTransition(fixture);
      tick();

      expect(testComponent.openStartCount).toBe(1);
      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeStartCount).toBe(1);
      expect(testComponent.closeCount).toBe(1);

      expect(getComputedStyle(sidenavElement.nativeElement).visibility).toEqual('hidden');
      expect(getComputedStyle(sidenavBackdropElement.nativeElement).visibility).toEqual('hidden');
    }));

    it('open/close() return a promise that resolves after animation end', fakeAsyncAdaptor(() => {
      let fixture = createFixture(BasicTestApp, builder, template, style);
      let sidenav: MdSidenav = fixture.debugElement
        .query(By.directive(MdSidenav)).componentInstance;
      let called = false;

      sidenav.open().then(() => {
        called = true;
      });

      expect(called).toBe(false);
      endSidenavTransition(fixture);
      tick();
      expect(called).toBe(true);

      called = false;
      sidenav.close().then(() => {
        called = true;
      });

      expect(called).toBe(false);
      endSidenavTransition(fixture);
      tick();
      expect(called).toBe(true);

    }));

    it('open/close() twice returns the same promise', fakeAsyncAdaptor(() => {
      let fixture = createFixture(BasicTestApp, builder, template, style);
      let sidenav: MdSidenav = fixture.debugElement
        .query(By.directive(MdSidenav)).componentInstance;

      let promise = sidenav.open();
      expect(sidenav.open()).toBe(promise);
      fixture.detectChanges();
      tick();

      promise = sidenav.close();
      expect(sidenav.close()).toBe(promise);
      tick();
    }));

    it('open() then close() cancel animations when called too fast', fakeAsyncAdaptor(() => {
      let fixture = createFixture(BasicTestApp, builder, template, style);
      let sidenav: MdSidenav = fixture.debugElement
        .query(By.directive(MdSidenav)).componentInstance;

      let openCalled = false;
      let openCancelled = false;
      let closeCalled = false;

      sidenav.open().then(() => {
        openCalled = true;
      }, () => {
        openCancelled = true;
      });

      // We do not call transition end, close directly.
      sidenav.close().then(() => {
        closeCalled = true;
      });

      endSidenavTransition(fixture);
      tick();

      expect(openCalled).toBe(false);
      expect(openCancelled).toBe(true);
      expect(closeCalled).toBe(true);
      tick();
    }));

    it('close() then open() cancel animations when called too fast', fakeAsyncAdaptor(() => {
      let fixture = createFixture(BasicTestApp, builder, template, style);
      let sidenav: MdSidenav = fixture.debugElement
        .query(By.directive(MdSidenav)).componentInstance;

      let closeCalled = false;
      let closeCancelled = false;
      let openCalled = false;

      // First, open the sidenav completely.
      sidenav.open();
      endSidenavTransition(fixture);
      tick();

      // Then close and check behavior.
      sidenav.close().then(() => {
        closeCalled = true;
      }, () => {
        closeCancelled = true;
      });
      // We do not call transition end, open directly.
      sidenav.open().then(() => {
        openCalled = true;
      });

      endSidenavTransition(fixture);
      tick();

      expect(closeCalled).toBe(false);
      expect(closeCancelled).toBe(true);
      expect(openCalled).toBe(true);
      tick();
    }));

    it('does not throw when created without a sidenav', fakeAsyncAdaptor(() => {
      expect(() => {
        let fixture = createFixture(SidenavLayoutNoSidenavTestApp, builder, template, style);
        fixture.detectChanges();
        tick();
      }).not.toThrow();
    }));

    it('does throw when created with two sidenav on the same side', fakeAsyncAdaptor(() => {
      expect(() => {
        let fixture = createFixture(SidenavLayoutTwoSidenavTestApp, builder, template, style);
        fixture.detectChanges();
        tick();
      }).toThrow();
    }));
  });

  describe('attributes', () => {

    it('should correctly parse opened="false"', fakeAsyncAdaptor(() => {
      let newBuilder = builder.overrideTemplate(BasicTestApp, `
          <md-sidenav-layout>
            <md-sidenav #sidenav mode="side" opened="false">
              Closed Sidenav.
            </md-sidenav>
          </md-sidenav-layout>`);

      let fixture = createFixture(BasicTestApp, newBuilder, template, style);
      fixture.detectChanges();

      let sidenavEl = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;

      expect(sidenavEl.classList).toContain('md-sidenav-closed');
      expect(sidenavEl.classList).not.toContain('md-sidenav-opened');
    }));

    it('should correctly parse opened="true"', fakeAsyncAdaptor(() => {
      let newBuilder = builder.overrideTemplate(BasicTestApp, `
          <md-sidenav-layout>
            <md-sidenav #sidenav mode="side" opened="true">
              Closed Sidenav.
            </md-sidenav>
          </md-sidenav-layout>`);

      let fixture = createFixture(BasicTestApp, newBuilder, template, style);
      fixture.detectChanges();

      let sidenavEl = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;

      expect(sidenavEl.classList).not.toContain('md-sidenav-closed');
      expect(sidenavEl.classList).toContain('md-sidenav-opened');
    }));

  });

});


/** Test component that contains an MdSidenavLayout but no MdSidenav. */
@Component({
  selector: 'test-app',
  directives: [MD_SIDENAV_DIRECTIVES],
  template: `
    <md-sidenav-layout>
    </md-sidenav-layout>
  `,
})
class SidenavLayoutNoSidenavTestApp {
}


/** Test component that contains an MdSidenavLayout and 2 MdSidenav on the same side. */
@Component({
  selector: 'test-app',
  directives: [MD_SIDENAV_DIRECTIVES],
  template: `
    <md-sidenav-layout>
      <md-sidenav> </md-sidenav>
      <md-sidenav> </md-sidenav>
    </md-sidenav-layout>
  `,
})
class SidenavLayoutTwoSidenavTestApp {
}


/** Test component that contains an MdSidenavLayout and one MdSidenav. */
@Component({
  selector: 'test-app',
  directives: [MD_SIDENAV_DIRECTIVES],
  template: `
    <md-sidenav-layout>
      <md-sidenav #sidenav align="start"
                  (open-start)="openStart()"
                  (open)="open()"
                  (close-start)="closeStart()"
                  (close)="close()">
        Content.
      </md-sidenav>
      <button (click)="sidenav.open()" class="open"></button>
      <button (click)="sidenav.close()" class="close"></button>
    </md-sidenav-layout>
  `,
})
class BasicTestApp {
  openStartCount: number = 0;
  openCount: number = 0;
  closeStartCount: number = 0;
  closeCount: number = 0;

  openStart() {
    this.openStartCount++;
  }

  open() {
    this.openCount++;
  }

  closeStart() {
    this.closeStartCount++;
  }

  close() {
    this.closeCount++;
  }
}
