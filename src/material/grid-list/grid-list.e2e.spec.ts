import {browser} from 'protractor';
import {expectToExist} from '@angular/cdk/testing/e2e';

describe('grid-list', () => {
  beforeEach(async () => await browser.get('/grid-list'));

  it('should render a grid list container', async () => {
    await expectToExist('mat-grid-list');
  });

  it('should render list items inside the grid list container', async () => {
    await expectToExist('mat-grid-list mat-grid-tile');
  });
});
