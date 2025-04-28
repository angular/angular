import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {createNewEvent} from '../../shared/utils';
import {FavoriteColorReactiveComponent} from './favorite-color.component';

describe('Favorite Color Component', () => {
  let component: FavoriteColorReactiveComponent;
  let fixture: ComponentFixture<FavoriteColorReactiveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FavoriteColorReactiveComponent],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteColorReactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // #docregion view-to-model
  it('should update the value of the input field', () => {
    const input = fixture.nativeElement.querySelector('input');
    const event = createNewEvent('input');

    input.value = 'Red';
    input.dispatchEvent(event);

    expect(fixture.componentInstance.favoriteColorControl.value).toEqual('Red');
  });
  // #enddocregion view-to-model

  // #docregion model-to-view
  it('should update the value in the control', () => {
    component.favoriteColorControl.setValue('Blue');

    const input = fixture.nativeElement.querySelector('input');

    expect(input.value).toBe('Blue');
  });
  // #enddocregion model-to-view
});
