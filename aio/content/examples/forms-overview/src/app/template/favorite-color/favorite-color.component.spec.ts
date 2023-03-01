import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { createNewEvent } from '../../shared/utils';
import { FavoriteColorComponent } from './favorite-color.component';

describe('FavoriteColorComponent', () => {
  let component: FavoriteColorComponent;
  let fixture: ComponentFixture<FavoriteColorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({imports: [FormsModule], declarations: [FavoriteColorComponent]})
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // #docregion model-to-view
  it('should update the favorite color on the input field', fakeAsync(() => {
       component.favoriteColor = 'Blue';

       fixture.detectChanges();

       tick();

       const input = fixture.nativeElement.querySelector('input');

       expect(input.value).toBe('Blue');
     }));
  // #enddocregion model-to-view

  // #docregion view-to-model
  it('should update the favorite color in the component', fakeAsync(() => {
       const input = fixture.nativeElement.querySelector('input');
       const event = createNewEvent('input');

       input.value = 'Red';
       input.dispatchEvent(event);

       fixture.detectChanges();

       expect(component.favoriteColor).toEqual('Red');
     }));
  // #enddocregion view-to-model
});
