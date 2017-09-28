import {browser} from 'protractor';
import {expectToExist} from '../util/index';
import {screenshot} from '../screenshot';

describe('list', () => {
  beforeEach(() => browser.get('/list'));

  it('should render a list container', () => {
    expectToExist('mat-list');
    screenshot();
  });

  it('should render list items inside the list container', () => {
    expectToExist('mat-list mat-list-item');
  });
});
