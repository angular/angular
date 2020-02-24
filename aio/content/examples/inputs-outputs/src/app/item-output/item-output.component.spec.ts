import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemOutputComponent } from './item-output.component';

describe('ItemOutputComponent', () => {
  let component: ItemOutputComponent;
  let fixture: ComponentFixture<ItemOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemOutputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
