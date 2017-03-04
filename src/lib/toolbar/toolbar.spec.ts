import {Component} from '@angular/core';
import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MdToolbarModule} from './index';


describe('MdToolbar', () => {

  let fixture: ComponentFixture<TestApp>;
  let testComponent: TestApp;
  let toolbarElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdToolbarModule.forRoot()],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestApp);
    testComponent = fixture.debugElement.componentInstance;
    toolbarElement = fixture.debugElement.query(By.css('md-toolbar')).nativeElement;
  });

  it('should apply class based on color attribute', () => {
    testComponent.toolbarColor = 'primary';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('mat-primary')).toBe(true);

    testComponent.toolbarColor = 'accent';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('mat-primary')).toBe(false);
    expect(toolbarElement.classList.contains('mat-accent')).toBe(true);

    testComponent.toolbarColor = 'warn';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('mat-accent')).toBe(false);
    expect(toolbarElement.classList.contains('mat-warn')).toBe(true);
  });

  it('should set the toolbar role on the host', () => {
    expect(toolbarElement.getAttribute('role')).toBe('toolbar');
  });

});


@Component({template: `<md-toolbar [color]="toolbarColor">Test Toolbar</md-toolbar>`})
class TestApp {
  toolbarColor: string;
}
