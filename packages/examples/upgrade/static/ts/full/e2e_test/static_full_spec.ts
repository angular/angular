/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../../test-utils';

function loadPage() {
  browser.rootEl = 'example-app';
  browser.get('/');
}

describe('upgrade/static (full)', () => {
  beforeEach(loadPage);
  afterEach(verifyNoBrowserErrors);

  it('should render the `ng2-heroes` component', () => {
    expect(element(by.css('h1')).getText()).toEqual('Heroes');
    expect(element.all(by.css('p')).get(0).getText()).toEqual('There are 3 heroes.');
  });

  it('should render 3 ng1-hero components', () => {
    const heroComponents = element.all(by.css('ng1-hero'));
    expect(heroComponents.count()).toEqual(3);
  });

  it('should add a new hero when the "Add Hero" button is pressed', () => {
    const addHeroButton = element.all(by.css('button')).last();
    expect(addHeroButton.getText()).toEqual('Add Hero');
    addHeroButton.click();
    const heroComponents = element.all(by.css('ng1-hero'));
    expect(heroComponents.last().element(by.css('h2')).getText()).toEqual('Kamala Khan');
  });

  it('should remove a hero when the "Remove" button is pressed', () => {
    let firstHero = element.all(by.css('ng1-hero')).get(0);
    expect(firstHero.element(by.css('h2')).getText()).toEqual('Superman');

    const removeHeroButton = firstHero.element(by.css('button'));
    expect(removeHeroButton.getText()).toEqual('Remove');
    removeHeroButton.click();

    const heroComponents = element.all(by.css('ng1-hero'));
    expect(heroComponents.count()).toEqual(2);

    firstHero = element.all(by.css('ng1-hero')).get(0);
    expect(firstHero.element(by.css('h2')).getText()).toEqual('Wonder Woman');
  });
});
