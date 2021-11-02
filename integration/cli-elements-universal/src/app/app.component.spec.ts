import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        TestTitleComponent,
      ],
      imports: [
        RouterTestingModule,
      ],
    });
    await TestBed.compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const appComp = fixture.componentInstance;

    expect(appComp).toBeTruthy();
    expect(appComp.title).toBe('cli-elements-universal');
  });

  it('should pass the app title to the `TitleComponent`', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const titleDebugElement = fixture.debugElement.query(By.directive(TestTitleComponent));
    const titleComp: TestTitleComponent = titleDebugElement.componentInstance;

    fixture.detectChanges();

    expect(titleComp).toBeTruthy();
    expect(titleComp.appName).toBe('cli-elements-universal');
  });

  // Helpers
  @Component({
    selector: 'app-title-ce',
    template: '',
  })
  class TestTitleComponent {
    @Input() appName = '';
  }
});
