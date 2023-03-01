import {TestBed, waitForAsync} from '@angular/core/testing';
import {AppComponent} from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          declarations: [AppComponent],
        })
        .compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'ng-update-migrations'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ng-update-migrations');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to ng-update-migrations!');
  });
});
