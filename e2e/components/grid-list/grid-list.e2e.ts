import {browser} from 'protractor';
import {expectToExist} from '../../util/asserts';

describe('grid-list', () => {
  beforeEach(() => browser.get('/grid-list'));

  it('should render a grid list container', () => {
    expectToExist('md-grid-list');
  });

  it('should render list items inside the grid list container', () => {
    expectToExist('md-grid-list md-grid-tile');
  });
});
