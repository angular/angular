// #docplaster
// #docregion
import {TestBed, waitForAsync} from '@angular/core/testing';
// #enddocregion
import {AppComponent} from './app-initial.component';
/*
// #docregion
import { AppComponent } from './app.component';

describe('AppComponent', () => {
// #enddocregion
*/
describe('AppComponent (initial CLI version)', () => {
  // #docregion
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
    });
  }));
  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  }));
  it("should have as title 'app'", waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('app');
  }));
  it('should render title', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to app!');
  }));
});
describe('AppComponent (initial CLI version - as it should be)', () => {
  let app;
  let de;
  let fixture;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
    });
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    de = fixture.debugElement;
  });
  it('should create the app', () => {
    expect(app).toBeDefined();
  });
  it("should have as title 'app'", () => {
    expect(app.title).toEqual('app');
  });
  it('should render title in an h1 tag', () => {
    fixture.detectChanges();
    expect(de.nativeElement.querySelector('h1').textContent).toContain('Welcome to app!');
  });
});
//# sourceMappingURL=app-initial.component.spec.js.map
