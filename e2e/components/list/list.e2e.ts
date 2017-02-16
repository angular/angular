import {browser} from 'protractor';
import {expectToExist} from '../../util/asserts';
import {screenshot} from '../../screenshot';

describe('list', () => {
  beforeEach(() => browser.get('/list'));

  it('should render a list container', () => {
    expectToExist('md-list');
    screenshot();
  });

  it('should render list items inside the list container', () => {
    expectToExist('md-list md-list-item');
  });
});
