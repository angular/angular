/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser, by, element, ElementArrayFinder, ElementFinder} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../../test-utils';

import {addCustomMatchers} from './e2e_util';

function loadPage() {
  browser.rootEl = 'example-app';
  browser.get('/');
}

describe('upgrade/static (lite)', () => {
  let showHideBtn: ElementFinder;
  let ng2Heroes: ElementFinder;
  let ng2HeroesHeader: ElementFinder;
  let ng2HeroesExtra: ElementFinder;
  let ng2HeroesAddBtn: ElementFinder;
  let ng1Heroes: ElementArrayFinder;

  const expectHeroes = (isShown: boolean, ng1HeroCount = 3, statusMessage = 'Ready') => {
    // Verify the show/hide button text.
    expect(showHideBtn.getText()).toBe(isShown ? 'Hide heroes' : 'Show heroes');

    // Verify the `<ng2-heroes>` component.
    expect(ng2Heroes.isPresent()).toBe(isShown);
    if (isShown) {
      expect(ng2HeroesHeader.getText()).toBe('Heroes');
      expect(ng2HeroesExtra.getText()).toBe(`Status: ${statusMessage}`);
    }

    // Verify the `<ng1-hero>` components.
    expect(ng1Heroes.count()).toBe(isShown ? ng1HeroCount : 0);
    if (isShown) {
      ng1Heroes.each((ng1Hero) => expect(ng1Hero).toBeAHero());
    }
  };

  beforeEach(() => {
    showHideBtn = element(by.binding('toggleBtnText'));

    ng2Heroes = element(by.css('.ng2-heroes'));
    ng2HeroesHeader = ng2Heroes.element(by.css('h1'));
    ng2HeroesExtra = ng2Heroes.element(by.css('.extra'));
    ng2HeroesAddBtn = ng2Heroes.element(by.buttonText('Add Hero'));

    ng1Heroes = element.all(by.css('.ng1-hero'));
  });
  beforeEach(addCustomMatchers);
  beforeEach(loadPage);
  afterEach(verifyNoBrowserErrors);

  it('should initially not render the heroes', () => expectHeroes(false));

  it('should toggle the heroes when clicking the "show/hide" button', () => {
    showHideBtn.click();
    expectHeroes(true);

    showHideBtn.click();
    expectHeroes(false);
  });

  it('should add a new hero when clicking the "add" button', () => {
    showHideBtn.click();
    ng2HeroesAddBtn.click();

    expectHeroes(true, 4, 'Added hero Kamala Khan');
    expect(ng1Heroes.last()).toHaveName('Kamala Khan');
  });

  it('should remove a hero when clicking its "remove" button', () => {
    showHideBtn.click();

    const firstHero = ng1Heroes.first();
    expect(firstHero).toHaveName('Superman');

    const removeBtn = firstHero.element(by.buttonText('Remove'));
    removeBtn.click();

    expectHeroes(true, 2, 'Removed hero Superman');
    expect(ng1Heroes.first()).not.toHaveName('Superman');
  });
});
