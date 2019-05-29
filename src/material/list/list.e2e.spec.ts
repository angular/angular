import {browser} from 'protractor';
import {expectToExist} from '@angular/cdk/testing/e2e';

describe('list', () => {
  beforeEach(async () => await browser.get('/list'));

  it('should render a list container', async () => {
    await expectToExist('mat-list');
  });

  it('should render list items inside the list container', async () => {
    await expectToExist('mat-list mat-list-item');
  });
});
