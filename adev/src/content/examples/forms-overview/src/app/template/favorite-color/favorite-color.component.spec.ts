import {ComponentFixture, TestBed} from '@angular/core/testing';

import {createNewEvent} from '../../shared/utils';
import {FavoriteColorTemplate} from './favorite-color.component';

describe('FavoriteColorComponent', () => {
  let component: FavoriteColorTemplate;
  let fixture: ComponentFixture<FavoriteColorTemplate>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(FavoriteColorTemplate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // #docregion model-to-view
  it('should update the favorite color on the input field', async () => {
    component.favoriteColor.set('Blue');

    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('Blue');
  });
  // #enddocregion model-to-view

  // #docregion view-to-model
  it('should update the favorite color in the component', async () => {
    const input = fixture.nativeElement.querySelector('input');
    const event = createNewEvent('input');

    input.value = 'Red';
    input.dispatchEvent(event);

    await fixture.whenStable();

    expect(component.favoriteColor()).toEqual('Red');
  });
  // #enddocregion view-to-model
});
