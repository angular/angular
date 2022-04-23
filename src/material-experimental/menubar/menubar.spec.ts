import {Component, ViewChild, ElementRef} from '@angular/core';
import {RIGHT_ARROW} from '@angular/cdk/keycodes';
import {CdkMenuBar} from '@angular/cdk/menu';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {dispatchKeyboardEvent} from '../../cdk/testing/private';
import {MatMenuBarModule} from './menubar-module';
import {MatMenuBar} from './menubar';

describe('MatMenuBar', () => {
  let fixture: ComponentFixture<SimpleMatMenuBar>;
  let nativeMatMenubar: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuBarModule],
      declarations: [SimpleMatMenuBar],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMatMenuBar);
    fixture.detectChanges();

    nativeMatMenubar = fixture.componentInstance.nativeMatMenubar.nativeElement;
  });

  it('should have the menubar role', () => {
    expect(nativeMatMenubar.getAttribute('role')).toBe('menubar');
  });

  it('should have the cdk and material classes set', () => {
    expect(nativeMatMenubar.classList.contains('cdk-menu-bar')).toBeTrue();
    expect(nativeMatMenubar.classList.contains('mat-menubar')).toBeTrue();
  });

  it('should have tabindex set to 0', () => {
    expect(nativeMatMenubar.getAttribute('tabindex')).toBe('0');
  });

  it('should toggle focused items on left/right click', () => {
    nativeMatMenubar.focus();

    expect(document.activeElement!.id).toBe('first');

    dispatchKeyboardEvent(nativeMatMenubar, 'keydown', RIGHT_ARROW);
    fixture.detectChanges();

    expect(document.activeElement!.id).toBe('second');
  });
});

@Component({
  template: `
    <mat-menubar>
      <mat-menubar-item id="first"></mat-menubar-item>
      <mat-menubar-item id="second"></mat-menubar-item>
    </mat-menubar>
  `,
})
class SimpleMatMenuBar {
  @ViewChild(CdkMenuBar) matMenubar: MatMenuBar;
  @ViewChild(CdkMenuBar, {read: ElementRef}) nativeMatMenubar: ElementRef;
}
