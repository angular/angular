import { TestBed, waitForAsync } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { ReactiveModule } from './reactive/reactive.module';
import { TemplateModule } from './template/template.module';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          imports: [ReactiveModule, TemplateModule],
          declarations: [AppComponent],
        })
        .compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
       const fixture = TestBed.createComponent(AppComponent);
       const app = fixture.componentInstance;

       expect(app).toBeTruthy();
     }));

  it('should render title', waitForAsync(() => {
       const fixture = TestBed.createComponent(AppComponent);
       fixture.detectChanges();

       const compiled = fixture.nativeElement as HTMLElement;
       expect(compiled.querySelector('h1')?.textContent).toContain('Forms Overview');
     }));
});
