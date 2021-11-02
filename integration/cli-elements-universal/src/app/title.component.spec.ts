import { TestBed } from '@angular/core/testing';
import { TitleComponent } from './title.component';

describe('TitleComponent', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({declarations: [TitleComponent]});
    await TestBed.compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(TitleComponent);
    const titleComp = fixture.componentInstance;

    expect(titleComp).toBeTruthy();
  });

  it('should render the title using the specified app name', () => {
    const fixture = TestBed.createComponent(TitleComponent);
    const titleComp = fixture.componentInstance;
    const titleElem = fixture.nativeElement;

    titleComp.appName = 'Test';
    fixture.detectChanges();

    expect(titleElem.querySelector('h1').textContent).toBe('Test app is running!');
  });
});
