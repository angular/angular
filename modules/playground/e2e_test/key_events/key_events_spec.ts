/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element, protractor} from 'protractor';

import {verifyNoBrowserErrors} from '../../../../dev-infra/benchmark/driver-utilities';

const Key = protractor.Key;

describe('key_events', function() {
  const URL = '/';

  afterEach(verifyNoBrowserErrors);
  beforeEach(() => {
    browser.get(URL);
  });

  it('should display correct key names', function() {
    const firstArea = element.all(by.css('.sample-area')).get(0);
    expect(firstArea.getText()).toEqual('(none)');

    // testing different key categories:
    firstArea.sendKeys(Key.ENTER);
    expect(firstArea.getText()).toEqual('enter');

    firstArea.sendKeys(Key.SHIFT, Key.ENTER);
    expect(firstArea.getText()).toEqual('shift.enter');

    firstArea.sendKeys(Key.CONTROL, Key.SHIFT, Key.ENTER);
    expect(firstArea.getText()).toEqual('control.shift.enter');

    firstArea.sendKeys(' ');
    expect(firstArea.getText()).toEqual('space');

    // It would not work with a letter which position depends on the keyboard layout (ie AZERTY vs
    // QWERTY), see https://code.google.com/p/chromedriver/issues/detail?id=553
    firstArea.sendKeys('u');
    expect(firstArea.getText()).toEqual('u');

    firstArea.sendKeys(Key.CONTROL, 'b');
    expect(firstArea.getText()).toEqual('control.b');

    firstArea.sendKeys(Key.F1);
    expect(firstArea.getText()).toEqual('f1');

    firstArea.sendKeys(Key.ALT, Key.F1);
    expect(firstArea.getText()).toEqual('alt.f1');

    firstArea.sendKeys(Key.CONTROL, Key.F1);
    expect(firstArea.getText()).toEqual('control.f1');

    // There is an issue with Key.NUMPAD0 (and other NUMPADx):
    // chromedriver does not correctly set the location property on the event to
    // specify that the key is on the numeric keypad (event.location = 3)
    // so the following test fails:
    // firstArea.sendKeys(Key.NUMPAD0);
    // expect(firstArea.getText()).toEqual('0');
  });

  it('should correctly react to the specified key', function() {
    const secondArea = element.all(by.css('.sample-area')).get(1);
    secondArea.sendKeys(Key.SHIFT, Key.ENTER);
    expect(secondArea.getText()).toEqual('You pressed shift.enter!');
  });

  it('should not react to incomplete keys', function() {
    const secondArea = element.all(by.css('.sample-area')).get(1);
    secondArea.sendKeys(Key.ENTER);
    expect(secondArea.getText()).toEqual('');
  });

  it('should not react to keys with more modifiers', function() {
    const secondArea = element.all(by.css('.sample-area')).get(1);
    secondArea.sendKeys(Key.CONTROL, Key.SHIFT, Key.ENTER);
    expect(secondArea.getText()).toEqual('');
  });
});
