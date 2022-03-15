import {Component, ElementRef, ViewChild} from '@angular/core';
import {ComponentFixture, waitForAsync, TestBed} from '@angular/core/testing';
import {CdkMenuItem, CdkMenuModule, CdkMenu} from '@angular/cdk-experimental/menu';
import {MatMenuBarItem} from './menubar-item';
import {MatMenuBarModule} from './menubar-module';

describe('MatMenuBarItem', () => {
  let fixture: ComponentFixture<SimpleMenuBarItem>;
  let menubarItem: MatMenuBarItem;
  let nativeMenubarItem: HTMLElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatMenuBarModule, CdkMenuModule],
        declarations: [SimpleMenuBarItem],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMenuBarItem);
    fixture.detectChanges();

    menubarItem = fixture.componentInstance.menubarItem;
    nativeMenubarItem = fixture.componentInstance.nativeMenubarItem.nativeElement;
  });

  it('should have the menuitem role', () => {
    expect(nativeMenubarItem.getAttribute('role')).toBe('menuitem');
  });

  it('should be a button type', () => {
    expect(nativeMenubarItem.getAttribute('type')).toBe('button');
  });

  it('should not set the aria-disabled attribute when false', () => {
    expect(nativeMenubarItem.hasAttribute('aria.disabled')).toBeFalse();
  });

  it('should coerce and set aria-disabled attribute', () => {
    (menubarItem.disabled as any) = '';
    fixture.detectChanges();

    expect(nativeMenubarItem.getAttribute('aria-disabled')).toBe('true');
  });

  it('should have cdk and material classes set', () => {
    expect(nativeMenubarItem.classList.contains('cdk-menu-item')).toBeTrue();
    expect(nativeMenubarItem.classList.contains('mat-menubar-item')).toBeTrue();
  });

  it('should open the attached menu on click', () => {
    nativeMenubarItem.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.menu).toBeDefined();
  });

  it('should have initial tab index set to -1', () => {
    expect(nativeMenubarItem.tabIndex).toBe(-1);
  });
});

@Component({
  template: `
    <mat-menubar>
      <mat-menubar-item [cdkMenuTriggerFor]="sub">File</mat-menubar-item>
    </mat-menubar>

    <ng-template #sub>
      <div #menu cdkMenu>
        <button cdkMenuItem></button>
      </div>
    </ng-template>
  `,
})
class SimpleMenuBarItem {
  @ViewChild(CdkMenuItem) menubarItem: MatMenuBarItem;
  @ViewChild(CdkMenuItem, {read: ElementRef}) nativeMenubarItem: ElementRef;

  @ViewChild('menu') menu: CdkMenu;
}
