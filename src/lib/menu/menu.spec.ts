import {TestBed, async} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdMenuModule, MdMenuTrigger} from './menu';


describe('MdMenu', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdMenuModule.forRoot()],
      declarations: [SimpleMenu],
    });

    TestBed.compileComponents();
  }));

  it('should open the menu as an idempotent operation', () => {
    let fixture = TestBed.createComponent(SimpleMenu);
    fixture.detectChanges();
    let menu = fixture.debugElement.query(By.css('.md-menu'));
    expect(menu).toBe(null);
    expect(() => {
      fixture.componentInstance.trigger.openMenu();
      fixture.componentInstance.trigger.openMenu();

      menu = fixture.debugElement.query(By.css('.md-menu'));
      expect(menu.nativeElement.innerHTML.trim()).toEqual('Content');
    }).not.toThrowError();
  });
});

@Component({
  template: `
    <button [md-menu-trigger-for]="menu">Toggle menu</button>
    <md-menu #menu="mdMenu">
      Content
    </md-menu>
  `
})
class SimpleMenu {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;
}
