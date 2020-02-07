import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { ApplicationOperations } from 'ng-devtools';
import { DemoApplicationOperations } from '../demo-application-operations';

describe('AppComponent (Demo Todo App)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ApplicationOperations,
          useClass: DemoApplicationOperations,
        },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
