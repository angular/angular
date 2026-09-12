import {TestBed} from '@angular/core/testing';

import {ProfileEditorComponent} from './profile-editor.component';

describe('ProfileEditorComponent', () => {
  it('updates the parent form value and validation from the child component', async () => {
    const fixture = TestBed.createComponent(ProfileEditorComponent);
    await fixture.whenStable();

    fixture.componentInstance.profileForm.controls.firstName.setValue('Nancy');
    await fixture.whenStable();

    expect(fixture.componentInstance.profileForm.invalid).toBeTrue();

    const zipInput = fixture.nativeElement.querySelector('#zip');
    if (!(zipInput instanceof HTMLInputElement)) {
      throw new Error('Expected the address editor to contain a zip input.');
    }
    zipInput.value = '12345';
    zipInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.profileForm.controls.address.controls.zip.value).toBe('12345');
    expect(fixture.componentInstance.profileForm.valid).toBeTrue();
  });
});
