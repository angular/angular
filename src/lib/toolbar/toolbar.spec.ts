import {Component} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MdToolbarModule} from './toolbar';


describe('MdToolbar', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdToolbarModule.forRoot()],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(TestApp);
    let testComponent = fixture.debugElement.componentInstance;
    let toolbarElement = fixture.debugElement.query(By.css('md-toolbar')).nativeElement;

    testComponent.toolbarColor = 'primary';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('md-primary')).toBe(true);

    testComponent.toolbarColor = 'accent';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('md-primary')).toBe(false);
    expect(toolbarElement.classList.contains('md-accent')).toBe(true);

    testComponent.toolbarColor = 'warn';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('md-accent')).toBe(false);
    expect(toolbarElement.classList.contains('md-warn')).toBe(true);
  });
});


@Component({template: `<md-toolbar [color]="toolbarColor">Test Toolbar</md-toolbar>`})
class TestApp {
  toolbarColor: string;
}
