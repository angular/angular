import {browser} from 'protractor';
import {expectToExist} from '../../util/asserts';

describe('list', () => {
  beforeEach(() => browser.get('/list'));

  it('should render a list container', () => {
    expectToExist('md-list');
  });

  it('should render list items inside the list container', () => {
    expectToExist('md-list md-list-item');
  });
});
