import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeavyComponent } from './heavy.component';

describe('HeavyComponent', () => {
  let component: HeavyComponent;
  let fixture: ComponentFixture<HeavyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HeavyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeavyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
