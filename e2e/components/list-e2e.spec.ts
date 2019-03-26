import {browser} from 'protractor';
import {expectToExist} from '../util/index';

// TODO(mmalerba): These tests are disabled due to an issue with animations.
// (See https://github.com/angular/material2/issues/15614)
// Re-enable once the issue is resolved.
// tslint:disable-next-line:ban
xdescribe('list', () => {
  beforeEach(async () => await browser.get('/list'));

  it('should render a list container', async () => {
    await expectToExist('mat-list');
  });

  it('should render list items inside the list container', async () => {
    await expectToExist('mat-list mat-list-item');
  });
});
