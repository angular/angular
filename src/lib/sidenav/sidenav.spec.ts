import {fakeAsync, async, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {A11yModule} from '@angular/cdk/a11y';
import {PlatformModule} from '@angular/cdk/platform';
import {ESCAPE} from '@angular/cdk/keycodes';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {MdSidenav, MdSidenavModule, MdSidenavContainer} from './index';


describe('MdSidenav', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSidenavModule, A11yModule, PlatformModule, NoopAnimationsModule],
      declarations: [
        BasicTestApp,
        SidenavContainerNoSidenavTestApp,
        SidenavSetToOpenedFalse,
        SidenavSetToOpenedTrue,
        SidenavDynamicAlign,
        SidenavWitFocusableElements,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('methods', () => {
    it('should be able to open and close', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);

      fixture.detectChanges();
      tick();

      let testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      let sidenav = fixture.debugElement.query(By.directive(MdSidenav));
      let sidenavBackdropElement = fixture.debugElement.query(By.css('.mat-sidenav-backdrop'));

      fixture.debugElement.query(By.css('.open')).nativeElement.click();
      fixture.detectChanges();

      expect(testComponent.openCount).toBe(0);
      expect(testComponent.closeCount).toBe(0);

      tick();

      expect(sidenav.componentInstance._isAnimating).toBe(false);
      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeCount).toBe(0);
      expect(getComputedStyle(sidenav.nativeElement).visibility).toBe('visible');
      expect(getComputedStyle(sidenavBackdropElement.nativeElement).visibility).toBe('visible');

      fixture.debugElement.query(By.css('.close')).nativeElement.click();
      fixture.detectChanges();

      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeCount).toBe(0);

      tick();

      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeCount).toBe(1);
      expect(getComputedStyle(sidenav.nativeElement).visibility).toBe('hidden');
      expect(getComputedStyle(sidenavBackdropElement.nativeElement).visibility).toBe('hidden');
    }));

    it('does not throw when created without a sidenav', fakeAsync(() => {
      expect(() => {
        let fixture = TestBed.createComponent(BasicTestApp);
        fixture.detectChanges();
        tick();
      }).not.toThrow();
    }));

    it('should emit the backdropClick event when the backdrop is clicked', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      let openButtonElement = fixture.debugElement.query(By.css('.open')).nativeElement;

      openButtonElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.backdropClickedCount).toBe(0);

      fixture.debugElement.query(By.css('.mat-sidenav-backdrop')).nativeElement.click();
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
      tick();

      let testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      let sidenav = fixture.debugElement.query(By.directive(MdSidenav));

      sidenav.componentInstance.open();
      fixture.detectChanges();
      tick();

      expect(testComponent.openCount).toBe(1, 'Expected one open event.');
      expect(testComponent.closeCount).toBe(0, 'Expected no close events.');

      dispatchKeyboardEvent(sidenav.nativeElement, 'keydown', ESCAPE);
      fixture.detectChanges();
      tick();

      expect(testComponent.closeCount).toBe(1, 'Expected one close event.');
    }));

    it('should not close by pressing escape when disableClose is set', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let sidenav = fixture.debugElement.query(By.directive(MdSidenav));

      sidenav.componentInstance.disableClose = true;
      sidenav.componentInstance.open();
      fixture.detectChanges();
      tick();

      dispatchKeyboardEvent(sidenav.nativeElement, 'keydown', ESCAPE);
      fixture.detectChanges();
      tick();

      expect(testComponent.closeCount).toBe(0);
    }));

    it('should not close by clicking on the backdrop when disableClose is set', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

      sidenav.disableClose = true;
      sidenav.open();
      fixture.detectChanges();
      tick();

      fixture.debugElement.query(By.css('.mat-sidenav-backdrop')).nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.closeCount).toBe(0);
    }));

    it('should restore focus on close if focus is inside sidenav', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);

      fixture.detectChanges();
      tick();

      let sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;
      let openButton = fixture.componentInstance.openButton.nativeElement;
      let sidenavButton = fixture.componentInstance.sidenavButton.nativeElement;

      openButton.focus();
      sidenav.open();
      fixture.detectChanges();
      tick();
      sidenavButton.focus();

      sidenav.close();
      fixture.detectChanges();
      tick();

      expect(document.activeElement)
          .toBe(openButton, 'Expected focus to be restored to the open button on close.');
    }));

    it('should not restore focus on close if focus is outside sidenav', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let sidenav: MdSidenav = fixture.debugElement
          .query(By.directive(MdSidenav)).componentInstance;
      let openButton = fixture.componentInstance.openButton.nativeElement;
      let closeButton = fixture.componentInstance.closeButton.nativeElement;

      openButton.focus();
      sidenav.open();

      fixture.detectChanges();
      tick();
      closeButton.focus();

      sidenav.close();
      fixture.detectChanges();
      tick();

      expect(document.activeElement)
          .toBe(closeButton, 'Expected focus not to be restored to the open button on close.');
    }));
  });

  describe('attributes', () => {
    it('should correctly parse opened="false"', () => {
      let fixture = TestBed.createComponent(SidenavSetToOpenedFalse);

      fixture.detectChanges();

      let sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

      expect((sidenav as MdSidenav).opened).toBe(false);
    });

    it('should correctly parse opened="true"', () => {
      let fixture = TestBed.createComponent(SidenavSetToOpenedTrue);

      fixture.detectChanges();

      let sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;

      expect((sidenav as MdSidenav).opened).toBe(true);
    });

    it('should remove align attr from DOM', () => {
      const fixture = TestBed.createComponent(BasicTestApp);
      fixture.detectChanges();

      const sidenavEl = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;
      expect(sidenavEl.hasAttribute('align'))
          .toBe(false, 'Expected sidenav not to have a native align attribute.');
    });

    it('should throw when multiple sidenavs have the same align', fakeAsync(() => {
      const fixture = TestBed.createComponent(SidenavDynamicAlign);
      fixture.detectChanges();
      tick();

      const testComponent: SidenavDynamicAlign = fixture.debugElement.componentInstance;
      testComponent.sidenav1Align = 'end';

      expect(() => fixture.detectChanges()).toThrow();
    }));

    it('should not throw when sidenavs swap sides', () => {
      const fixture = TestBed.createComponent(SidenavDynamicAlign);
      fixture.detectChanges();

      const testComponent: SidenavDynamicAlign = fixture.debugElement.componentInstance;
      testComponent.sidenav1Align = 'end';
      testComponent.sidenav2Align = 'start';

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('focus trapping behavior', () => {
    let fixture: ComponentFixture<SidenavWitFocusableElements>;
    let testComponent: SidenavWitFocusableElements;
    let sidenav: MdSidenav;
    let firstFocusableElement: HTMLElement;
    let lastFocusableElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SidenavWitFocusableElements);
      testComponent = fixture.debugElement.componentInstance;
      sidenav = fixture.debugElement.query(By.directive(MdSidenav)).componentInstance;
      firstFocusableElement = fixture.debugElement.query(By.css('.link1')).nativeElement;
      lastFocusableElement = fixture.debugElement.query(By.css('.link1')).nativeElement;
      lastFocusableElement.focus();
    });

    it('should trap focus when opened in "over" mode', fakeAsync(() => {
      testComponent.mode = 'over';
      lastFocusableElement.focus();

      sidenav.open();
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(firstFocusableElement);
    }));

    it('should trap focus when opened in "push" mode', fakeAsync(() => {
      testComponent.mode = 'push';
      lastFocusableElement.focus();

      sidenav.open();
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(firstFocusableElement);
    }));

    it('should not trap focus when opened in "side" mode', fakeAsync(() => {
      testComponent.mode = 'side';
      lastFocusableElement.focus();

      sidenav.open();
      fixture.detectChanges();
      tick();

      expect(document.activeElement).toBe(lastFocusableElement);
    }));
  });
});

describe('MdSidenavContainer', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSidenavModule, A11yModule, PlatformModule, NoopAnimationsModule],
      declarations: [SidenavContainerTwoSidenavTestApp, SidenavDelayed],
    });

    TestBed.compileComponents();
  }));

  it('should be able to open and close all sidenavs', fakeAsync(() => {
    const fixture = TestBed.createComponent(SidenavContainerTwoSidenavTestApp);

    fixture.detectChanges();

    const testComponent: SidenavContainerTwoSidenavTestApp =
      fixture.debugElement.componentInstance;
    const sidenavs = fixture.debugElement.queryAll(By.directive(MdSidenav));

    expect(sidenavs.every(sidenav => sidenav.componentInstance.opened)).toBe(false);

    testComponent.sidenavContainer.open();
    fixture.detectChanges();
    tick();

    expect(sidenavs.every(sidenav => sidenav.componentInstance.opened)).toBe(true);

    testComponent.sidenavContainer.close();
    fixture.detectChanges();
    tick();

    expect(sidenavs.every(sidenav => sidenav.componentInstance.opened)).toBe(false);
  }));

  it('should animate the content when a sidenav is added at a later point', fakeAsync(() => {
    const fixture = TestBed.createComponent(SidenavDelayed);

    fixture.detectChanges();

    const contentElement = fixture.debugElement.nativeElement.querySelector('.mat-sidenav-content');

    expect(parseInt(contentElement.style.marginLeft)).toBeFalsy();

    fixture.componentInstance.showSidenav = true;
    fixture.detectChanges();

    fixture.componentInstance.sidenav.open();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(parseInt(contentElement.style.marginLeft)).toBeGreaterThan(0);
  }));
});


/** Test component that contains an MdSidenavContainer but no MdSidenav. */
@Component({template: `<md-sidenav-container></md-sidenav-container>`})
class SidenavContainerNoSidenavTestApp { }

/** Test component that contains an MdSidenavContainer and 2 MdSidenav on the same side. */
@Component({
  template: `
    <md-sidenav-container>
      <md-sidenav align="start"> </md-sidenav>
      <md-sidenav align="end"> </md-sidenav>
    </md-sidenav-container>`,
})
class SidenavContainerTwoSidenavTestApp {
  @ViewChild(MdSidenavContainer) sidenavContainer: MdSidenavContainer;
}

/** Test component that contains an MdSidenavContainer and one MdSidenav. */
@Component({
  template: `
    <md-sidenav-container (backdropClick)="backdropClicked()">
      <md-sidenav #sidenav align="start"
                  (open)="open()"
                  (close)="close()">
        <button #sidenavButton>Content.</button>
      </md-sidenav>
      <button (click)="sidenav.open()" class="open" #openButton></button>
      <button (click)="sidenav.close()" class="close" #closeButton></button>
    </md-sidenav-container>`,
})
class BasicTestApp {
  openCount: number = 0;
  closeCount: number = 0;
  backdropClickedCount: number = 0;

  @ViewChild('sidenavButton') sidenavButton: ElementRef;
  @ViewChild('openButton') openButton: ElementRef;
  @ViewChild('closeButton') closeButton: ElementRef;

  open() {
    this.openCount++;
  }

  close() {
    this.closeCount++;
  }

  backdropClicked() {
    this.backdropClickedCount++;
  }
}

@Component({
  template: `
    <md-sidenav-container>
      <md-sidenav #sidenav mode="side" opened="false">
        Closed Sidenav.
      </md-sidenav>
    </md-sidenav-container>`,
})
class SidenavSetToOpenedFalse { }

@Component({
  template: `
    <md-sidenav-container>
      <md-sidenav #sidenav mode="side" opened="true">
        Closed Sidenav.
      </md-sidenav>
    </md-sidenav-container>`,
})
class SidenavSetToOpenedTrue { }

@Component({
  template: `
    <md-sidenav-container>
      <md-sidenav #sidenav1 [align]="sidenav1Align"></md-sidenav>
      <md-sidenav #sidenav2 [align]="sidenav2Align"></md-sidenav>
    </md-sidenav-container>`,
})
class SidenavDynamicAlign {
  sidenav1Align = 'start';
  sidenav2Align = 'end';
}

@Component({
  template: `
    <md-sidenav-container>
      <md-sidenav align="start" [mode]="mode">
        <a class="link1" href="#">link1</a>
      </md-sidenav>
      <a class="link2" href="#">link2</a>
    </md-sidenav-container>`,
})
class SidenavWitFocusableElements {
  mode: string = 'over';
}


@Component({
  template: `
    <md-sidenav-container>
      <md-sidenav *ngIf="showSidenav" #sidenav mode="side">Sidenav</md-sidenav>
    </md-sidenav-container>
  `,
})
class SidenavDelayed {
  @ViewChild(MdSidenav) sidenav: MdSidenav;
  showSidenav = false;
}
