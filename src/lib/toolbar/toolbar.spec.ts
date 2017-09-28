import {Component} from '@angular/core';
import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatToolbarModule} from './index';


describe('MatToolbar', () => {

  let fixture: ComponentFixture<TestApp>;
  let testComponent: TestApp;
  let toolbarElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatToolbarModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestApp);
    testComponent = fixture.debugElement.componentInstance;
    toolbarElement = fixture.debugElement.query(By.css('mat-toolbar')).nativeElement;
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


@Component({template: `<mat-toolbar [color]="toolbarColor">Test Toolbar</mat-toolbar>`})
class TestApp {
  toolbarColor: string;
}
