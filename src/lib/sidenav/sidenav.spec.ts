import {Component} from '@angular/core';
import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MatSidenav, MatSidenavModule} from './index';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';


describe('MatSidenav', () => {
  let fixture: ComponentFixture<SidenavWithFixedPosition>;
  let sidenavEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule, NoopAnimationsModule],
      declarations: [SidenavWithFixedPosition],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(SidenavWithFixedPosition);
    fixture.detectChanges();

    sidenavEl = fixture.debugElement.query(By.directive(MatSidenav)).nativeElement;
  }));

  it('should be fixed position when in fixed mode', () => {
    expect(sidenavEl.classList).toContain('mat-sidenav-fixed');

    fixture.componentInstance.fixed = false;
    fixture.detectChanges();

    expect(sidenavEl.classList).not.toContain('mat-sidenav-fixed');
  });

  it('should set fixed bottom and top when in fixed mode', () => {
    expect(sidenavEl.style.top).toBe('20px');
    expect(sidenavEl.style.bottom).toBe('30px');

    fixture.componentInstance.fixed = false;
    fixture.detectChanges();

    expect(sidenavEl.style.top).toBeFalsy();
    expect(sidenavEl.style.bottom).toBeFalsy();
  });
});


@Component({
  template: `
    <mat-sidenav-container>
      <mat-sidenav
          #drawer
          [fixedInViewport]="fixed"
          [fixedTopGap]="fixedTop"
          [fixedBottomGap]="fixedBottom">
        Drawer.
      </mat-sidenav>
      <mat-sidenav-content>
        Some content.
      </mat-sidenav-content>
    </mat-sidenav-container>`,
})
class SidenavWithFixedPosition {
  fixed = true;
  fixedTop = 20;
  fixedBottom = 30;
}
