import {
  fakeAsync,
  async,
  tick,
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
} from '@angular/core/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDrawer, MatSidenavModule, MatDrawerContainer} from './index';
import {A11yModule} from '@angular/cdk/a11y';
import {PlatformModule} from '@angular/cdk/platform';
import {ESCAPE} from '@angular/cdk/keycodes';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';


describe('MatDrawer', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule, A11yModule, PlatformModule, NoopAnimationsModule],
      declarations: [
        BasicTestApp,
        DrawerContainerNoDrawerTestApp,
        DrawerSetToOpenedFalse,
        DrawerSetToOpenedTrue,
        DrawerDynamicPosition,
        DrawerWithFocusableElements,
        DrawerOpenBinding,
        DrawerWithoutFocusableElements,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('methods', () => {
    it('should be able to open', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTestApp);

      fixture.detectChanges();

      const testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      const drawer = fixture.debugElement.query(By.directive(MatDrawer));
      const drawerBackdropElement = fixture.debugElement.query(By.css('.mat-drawer-backdrop'));

      drawerBackdropElement.nativeElement.style.transition = 'none';
      fixture.debugElement.query(By.css('.open')).nativeElement.click();
      fixture.detectChanges();

      expect(testComponent.openCount).toBe(0);
      expect(testComponent.openStartCount).toBe(0);

      tick();
      expect(testComponent.openStartCount).toBe(1);
      fixture.detectChanges();

      expect(testComponent.openCount).toBe(1);
      expect(testComponent.openStartCount).toBe(1);
      expect(getComputedStyle(drawer.nativeElement).visibility).toBe('visible');
      expect(getComputedStyle(drawerBackdropElement.nativeElement).visibility).toBe('visible');
    }));

    it('should be able to close', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTestApp);

      fixture.detectChanges();

      const testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      const drawer = fixture.debugElement.query(By.directive(MatDrawer));
      const drawerBackdropElement = fixture.debugElement.query(By.css('.mat-drawer-backdrop'));

      drawerBackdropElement.nativeElement.style.transition = 'none';
      fixture.debugElement.query(By.css('.open')).nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      fixture.debugElement.query(By.css('.close')).nativeElement.click();
      fixture.detectChanges();

      expect(testComponent.closeCount).toBe(0);
      expect(testComponent.closeStartCount).toBe(0);

      tick();
      expect(testComponent.closeStartCount).toBe(1);
      fixture.detectChanges();

      expect(testComponent.closeCount).toBe(1);
      expect(testComponent.closeStartCount).toBe(1);
      expect(getComputedStyle(drawer.nativeElement).visibility).toBe('hidden');
      expect(getComputedStyle(drawerBackdropElement.nativeElement).visibility).toBe('hidden');
    }));

    it('should resolve the open method promise with an object', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTestApp);
      fixture.detectChanges();
      const drawer = fixture.debugElement.query(By.directive(MatDrawer));

      drawer.componentInstance.open().then(result => {
        expect(result).toBeTruthy();
        expect(result.type).toBe('open');
        expect(result.animationFinished).toBe(true);
      });
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }));

    it('should resolve the close method promise with an object', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTestApp);
      fixture.detectChanges();
      const drawer = fixture.debugElement.query(By.directive(MatDrawer));

      drawer.componentInstance.open();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      drawer.componentInstance.close().then(result => {
        expect(result).toBeTruthy();
        expect(result.type).toBe('close');
        expect(result.animationFinished).toBe(true);
      });
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }));

    it('should be able to close while the open animation is running', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTestApp);
      fixture.detectChanges();

      const testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      fixture.debugElement.query(By.css('.open')).nativeElement.click();
      fixture.detectChanges();

      expect(testComponent.openCount).toBe(0);
      expect(testComponent.closeCount).toBe(0);

      tick();
      fixture.debugElement.query(By.css('.close')).nativeElement.click();
      fixture.detectChanges();

      tick();
      fixture.detectChanges();

      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeCount).toBe(1);
    }));

    it('does not throw when created without a drawer', fakeAsync(() => {
      expect(() => {
        let fixture = TestBed.createComponent(BasicTestApp);
        fixture.detectChanges();
        tick();
      }).not.toThrow();
    }));

    it('should emit the backdropClick event when the backdrop is clicked', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      fixture.detectChanges();

      let testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      let openButtonElement = fixture.debugElement.query(By.css('.open')).nativeElement;

      openButtonElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.backdropClickedCount).toBe(0);

      fixture.debugElement.query(By.css('.mat-drawer-backdrop')).nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.backdropClickedCount).toBe(1);

      openButtonElement.click();
      fixture.detectChanges();
      tick();

      fixture.debugElement.query(By.css('.close')).nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.backdropClickedCount).toBe(1);
    }));

    it('should close when pressing escape', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);

      fixture.detectChanges();

      let testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      let drawer = fixture.debugElement.query(By.directive(MatDrawer));

      drawer.componentInstance.open();
      fixture.detectChanges();
      tick();

      expect(testComponent.openCount).toBe(1, 'Expected one open event.');
      expect(testComponent.openStartCount).toBe(1, 'Expected one open start event.');
      expect(testComponent.closeCount).toBe(0, 'Expected no close events.');
      expect(testComponent.closeStartCount).toBe(0, 'Expected no close start events.');

      dispatchKeyboardEvent(drawer.nativeElement, 'keydown', ESCAPE);
      fixture.detectChanges();
      tick();

      expect(testComponent.closeCount).toBe(1, 'Expected one close event.');
      expect(testComponent.closeStartCount).toBe(1, 'Expected one close start event.');
    }));

    it('should fire the open event when open on init', fakeAsync(() => {
      let fixture = TestBed.createComponent(DrawerSetToOpenedTrue);

      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.openCallback).toHaveBeenCalledTimes(1);
    }));

    it('should not close by pressing escape when disableClose is set', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let drawer = fixture.debugElement.query(By.directive(MatDrawer));

      drawer.componentInstance.disableClose = true;
      drawer.componentInstance.open();
      fixture.detectChanges();
      tick();

      dispatchKeyboardEvent(drawer.nativeElement, 'keydown', ESCAPE);
      fixture.detectChanges();
      tick();

      expect(testComponent.closeCount).toBe(0);
      expect(testComponent.closeStartCount).toBe(0);
    }));

    it('should not close by clicking on the backdrop when disableClose is set', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let drawer = fixture.debugElement.query(By.directive(MatDrawer)).componentInstance;

      drawer.disableClose = true;
      drawer.open();
      fixture.detectChanges();
      tick();

      fixture.debugElement.query(By.css('.mat-drawer-backdrop')).nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.closeCount).toBe(0);
      expect(testComponent.closeStartCount).toBe(0);
    }));

    it('should restore focus on close if focus is inside drawer', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);

      fixture.detectChanges();

      let drawer = fixture.debugElement.query(By.directive(MatDrawer)).componentInstance;
      let openButton = fixture.componentInstance.openButton.nativeElement;
      let drawerButton = fixture.componentInstance.drawerButton.nativeElement;

      openButton.focus();
      drawer.open();
      fixture.detectChanges();
      tick();
      drawerButton.focus();

      drawer.close();
      fixture.detectChanges();
      tick();

      expect(document.activeElement)
          .toBe(openButton, 'Expected focus to be restored to the open button on close.');
    }));

    it('should not restore focus on close if focus is outside drawer', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let drawer: MatDrawer = fixture.debugElement
          .query(By.directive(MatDrawer)).componentInstance;
      let openButton = fixture.componentInstance.openButton.nativeElement;
      let closeButton = fixture.componentInstance.closeButton.nativeElement;

      openButton.focus();
      drawer.open();

      fixture.detectChanges();
      tick();
      closeButton.focus();

      drawer.close();
      fixture.detectChanges();
      tick();

      expect(document.activeElement)
          .toBe(closeButton, 'Expected focus not to be restored to the open button on close.');
    }));
  });

  describe('attributes', () => {
    it('should correctly parse opened="false"', () => {
      let fixture = TestBed.createComponent(DrawerSetToOpenedFalse);

      fixture.detectChanges();

      let drawer = fixture.debugElement.query(By.directive(MatDrawer)).componentInstance;

      expect((drawer as MatDrawer).opened).toBe(false);
    });

    it('should correctly parse opened="true"', () => {
      let fixture = TestBed.createComponent(DrawerSetToOpenedTrue);

      fixture.detectChanges();

      let drawer = fixture.debugElement.query(By.directive(MatDrawer)).componentInstance;

      expect((drawer as MatDrawer).opened).toBe(true);
    });

    it('should remove align attr from DOM', () => {
      const fixture = TestBed.createComponent(BasicTestApp);
      fixture.detectChanges();

      const drawerEl = fixture.debugElement.query(By.css('mat-drawer')).nativeElement;
      expect(drawerEl.hasAttribute('align'))
          .toBe(false, 'Expected drawer not to have a native align attribute.');
    });

    it('should throw when multiple drawers have the same position', fakeAsync(() => {
      const fixture = TestBed.createComponent(DrawerDynamicPosition);
      fixture.detectChanges();
      tick();

      const testComponent: DrawerDynamicPosition = fixture.debugElement.componentInstance;
      testComponent.drawer1Position = 'end';

      expect(() => fixture.detectChanges()).toThrow();
    }));

    it('should not throw when drawers swap positions', () => {
      const fixture = TestBed.createComponent(DrawerDynamicPosition);
      fixture.detectChanges();

      const testComponent: DrawerDynamicPosition = fixture.debugElement.componentInstance;
      testComponent.drawer1Position = 'end';
      testComponent.drawer2Position = 'start';

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should bind 2-way bind on opened property', fakeAsync(() => {
      const fixture = TestBed.createComponent(DrawerOpenBinding);
      fixture.detectChanges();

      let drawer: MatDrawer = fixture.debugElement
          .query(By.directive(MatDrawer)).componentInstance;

      drawer.open();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.isOpen).toBe(true);
    }));

    it('should not throw when a two-way binding is toggled quickly while animating',
      fakeAsync(() => {
        TestBed
          .resetTestingModule()
          .configureTestingModule({
            imports: [MatSidenavModule, BrowserAnimationsModule],
            declarations: [DrawerOpenBinding],
          })
          .compileComponents();

        const fixture = TestBed.createComponent(DrawerOpenBinding);
        fixture.detectChanges();

        // Note that we need actual timeouts and the `BrowserAnimationsModule`
        // in order to test it correctly.
        setTimeout(() => {
          fixture.componentInstance.isOpen = !fixture.componentInstance.isOpen;
          expect(() => fixture.detectChanges()).not.toThrow();

          setTimeout(() => {
            fixture.componentInstance.isOpen = !fixture.componentInstance.isOpen;
            expect(() => fixture.detectChanges()).not.toThrow();
          }, 1);

          tick(1);
        }, 1);

        tick(1);
      }));

  });

  describe('focus trapping behavior', () => {
    let fixture: ComponentFixture<DrawerWithFocusableElements>;
    let testComponent: DrawerWithFocusableElements;
    let drawer: MatDrawer;
    let firstFocusableElement: HTMLElement;
    let lastFocusableElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(DrawerWithFocusableElements);
      testComponent = fixture.debugElement.componentInstance;
      drawer = fixture.debugElement.query(By.directive(MatDrawer)).componentInstance;
      firstFocusableElement = fixture.debugElement.query(By.css('.link1')).nativeElement;
      lastFocusableElement = fixture.debugElement.query(By.css('.link1')).nativeElement;
      lastFocusableElement.focus();
    });

    it('should trap focus when opened in "over" mode', fakeAsync(() => {
      testComponent.mode = 'over';
      lastFocusableElement.focus();

      drawer.open();
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(firstFocusableElement);
    }));

    it('should trap focus when opened in "push" mode', fakeAsync(() => {
      testComponent.mode = 'push';
      lastFocusableElement.focus();

      drawer.open();
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(firstFocusableElement);
    }));

    it('should not trap focus when opened in "side" mode', fakeAsync(() => {
      testComponent.mode = 'side';
      lastFocusableElement.focus();

      drawer.open();
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(lastFocusableElement);
    }));

    it('should focus the drawer if there are no focusable elements', fakeAsync(() => {
      fixture.destroy();

      const nonFocusableFixture = TestBed.createComponent(DrawerWithoutFocusableElements);
      const drawerEl = nonFocusableFixture.debugElement.query(By.directive(MatDrawer));
      nonFocusableFixture.detectChanges();

      drawerEl.componentInstance.open();
      nonFocusableFixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(drawerEl.nativeElement);
    }));

  });
});

describe('MatDrawerContainer', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule, A11yModule, PlatformModule, NoopAnimationsModule],
      declarations: [
        DrawerContainerTwoDrawerTestApp,
        DrawerDelayed,
        DrawerSetToOpenedTrue,
        DrawerContainerStateChangesTestApp,
        AutosizeDrawer,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should be able to open and close all drawers', fakeAsync(() => {
    const fixture = TestBed.createComponent(DrawerContainerTwoDrawerTestApp);

    fixture.detectChanges();

    const testComponent: DrawerContainerTwoDrawerTestApp =
      fixture.debugElement.componentInstance;
    const drawers = fixture.debugElement.queryAll(By.directive(MatDrawer));

    expect(drawers.every(drawer => drawer.componentInstance.opened)).toBe(false);

    testComponent.drawerContainer.open();
    fixture.detectChanges();
    tick();

    expect(drawers.every(drawer => drawer.componentInstance.opened)).toBe(true);

    testComponent.drawerContainer.close();
    fixture.detectChanges();
    tick();

    expect(drawers.every(drawer => drawer.componentInstance.opened)).toBe(false);
  }));

  it('should animate the content when a drawer is added at a later point', fakeAsync(() => {
    const fixture = TestBed.createComponent(DrawerDelayed);

    fixture.detectChanges();

    const contentElement = fixture.debugElement.nativeElement.querySelector('.mat-drawer-content');

    expect(parseInt(contentElement.style.marginLeft)).toBeFalsy();

    fixture.componentInstance.showDrawer = true;
    fixture.detectChanges();

    fixture.componentInstance.drawer.open();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(parseInt(contentElement.style.marginLeft)).toBeGreaterThan(0);
  }));

  it('should recalculate the margin if a drawer is destroyed', fakeAsync(() => {
    const fixture = TestBed.createComponent(DrawerContainerStateChangesTestApp);

    fixture.detectChanges();
    fixture.componentInstance.drawer.open();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const contentElement = fixture.debugElement.nativeElement.querySelector('.mat-drawer-content');
    const initialMargin = parseInt(contentElement.style.marginLeft);

    expect(initialMargin).toBeGreaterThan(0);

    fixture.componentInstance.renderDrawer = false;
    fixture.detectChanges();
    tick();

    expect(parseInt(contentElement.style.marginLeft)).toBeLessThan(initialMargin);
  }));

  it('should recalculate the margin if the drawer mode is changed', fakeAsync(() => {
    const fixture = TestBed.createComponent(DrawerContainerStateChangesTestApp);

    fixture.detectChanges();
    fixture.componentInstance.drawer.open();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const contentElement = fixture.debugElement.nativeElement.querySelector('.mat-drawer-content');
    const initialMargin = parseInt(contentElement.style.marginLeft);

    expect(initialMargin).toBeGreaterThan(0);

    fixture.componentInstance.mode = 'over';
    fixture.detectChanges();

    expect(parseInt(contentElement.style.marginLeft)).toBeLessThan(initialMargin);
  }));

  it('should not animate when the sidenav is open on load ', fakeAsync(() => {
    const fixture = TestBed.createComponent(DrawerSetToOpenedTrue);

    fixture.detectChanges();
    tick();

    const container = fixture.debugElement.nativeElement.querySelector('.mat-drawer-container');

    expect(container.classList).not.toContain('mat-drawer-transition');
  }));

  it('should recalculate the margin if a drawer changes size while open in autosize mode',
    fakeAsync(() => {
      const fixture = TestBed.createComponent(AutosizeDrawer);

      fixture.detectChanges();
      fixture.componentInstance.drawer.open();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const contentEl = fixture.debugElement.nativeElement.querySelector('.mat-drawer-content');
      const initialMargin = parseInt(contentEl.style.marginLeft);

      expect(initialMargin).toBeGreaterThan(0);

      fixture.componentInstance.fillerWidth = 200;
      fixture.detectChanges();
      tick(10);
      fixture.detectChanges();

      expect(parseInt(contentEl.style.marginLeft)).toBeGreaterThan(initialMargin);
      discardPeriodicTasks();
    }));

});


/** Test component that contains an MatDrawerContainer but no MatDrawer. */
@Component({template: `<mat-drawer-container></mat-drawer-container>`})
class DrawerContainerNoDrawerTestApp { }

/** Test component that contains an MatDrawerContainer and 2 MatDrawer in the same position. */
@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer position="start"></mat-drawer>
      <mat-drawer position="end"></mat-drawer>
    </mat-drawer-container>`,
})
class DrawerContainerTwoDrawerTestApp {
  @ViewChild(MatDrawerContainer) drawerContainer: MatDrawerContainer;
}

/** Test component that contains an MatDrawerContainer and one MatDrawer. */
@Component({
  template: `
    <mat-drawer-container (backdropClick)="backdropClicked()">
      <mat-drawer #drawer position="start"
                 (opened)="open()"
                 (openedStart)="openStart()"
                 (closed)="close()"
                 (closedStart)="closeStart()">
        <button #drawerButton>Content.</button>
      </mat-drawer>
      <button (click)="drawer.open()" class="open" #openButton></button>
      <button (click)="drawer.close()" class="close" #closeButton></button>
    </mat-drawer-container>`,
})
class BasicTestApp {
  openCount = 0;
  openStartCount = 0;
  closeCount = 0;
  closeStartCount = 0;
  backdropClickedCount = 0;

  @ViewChild('drawerButton') drawerButton: ElementRef;
  @ViewChild('openButton') openButton: ElementRef;
  @ViewChild('closeButton') closeButton: ElementRef;

  open() {
    this.openCount++;
  }

  openStart() {
    this.openStartCount++;
  }

  close() {
    this.closeCount++;
  }

  closeStart() {
    this.closeStartCount++;
  }

  backdropClicked() {
    this.backdropClickedCount++;
  }
}

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer #drawer mode="side" opened="false">
        Closed Drawer.
      </mat-drawer>
    </mat-drawer-container>`,
})
class DrawerSetToOpenedFalse { }

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer #drawer mode="side" opened="true" (opened)="openCallback()">
        Closed Drawer.
      </mat-drawer>
    </mat-drawer-container>`,
})
class DrawerSetToOpenedTrue {
  openCallback = jasmine.createSpy('open callback');
}

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer #drawer mode="side" [(opened)]="isOpen">
        Closed Drawer.
      </mat-drawer>
    </mat-drawer-container>`,
})
class DrawerOpenBinding {
  isOpen = false;
}

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer #drawer1 [position]="drawer1Position"></mat-drawer>
      <mat-drawer #drawer2 [position]="drawer2Position"></mat-drawer>
    </mat-drawer-container>`,
})
class DrawerDynamicPosition {
  drawer1Position = 'start';
  drawer2Position = 'end';
}

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer position="start" [mode]="mode">
        <a class="link1" href="#">link1</a>
      </mat-drawer>
      <a class="link2" href="#">link2</a>
    </mat-drawer-container>`,
})
class DrawerWithFocusableElements {
  mode: string = 'over';
}

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer position="start" mode="over">
        <button disabled>Not focusable</button>
      </mat-drawer>
    </mat-drawer-container>`,
})
class DrawerWithoutFocusableElements {}

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer *ngIf="showDrawer" #drawer mode="side">Drawer</mat-drawer>
    </mat-drawer-container>
  `,
})
class DrawerDelayed {
  @ViewChild(MatDrawer) drawer: MatDrawer;
  showDrawer = false;
}


@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer *ngIf="renderDrawer" [mode]="mode" style="width:100px"></mat-drawer>
    </mat-drawer-container>`,
})
class DrawerContainerStateChangesTestApp {
  @ViewChild(MatDrawer) drawer: MatDrawer;
  @ViewChild(MatDrawerContainer) drawerContainer: MatDrawerContainer;

  mode = 'side';
  renderDrawer = true;
}


@Component({
  template: `
    <mat-drawer-container autosize>
      <mat-drawer mode="push" [position]="drawer1Position">
        Text
        <div [style.width.px]="fillerWidth"></div>
      </mat-drawer>
    </mat-drawer-container>`,
})
class AutosizeDrawer {
  @ViewChild(MatDrawer) drawer: MatDrawer;
  fillerWidth = 0;
}
