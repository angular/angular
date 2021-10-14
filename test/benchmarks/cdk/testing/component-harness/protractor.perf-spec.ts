/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessLoader} from '@angular/cdk/testing';
import {MatButtonHarness} from '@angular/material/button/testing/button-harness';
import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {$$, element, by, browser} from 'protractor';
import {benchmark} from './protractor-benchmark-utilities';
import {NUM_BUTTONS} from './constants';

const FIRST_BUTTON = '0';
const MIDDLE_BUTTON = `${Math.floor(NUM_BUTTONS / 2)}`;
const LAST_BUTTON = `${NUM_BUTTONS - 1}`;

describe('baseline tests for interacting with the page through Protractor directly', () => {
  beforeEach(async () => {
    await browser.get('');
  });

  it('(baseline) should retrieve all of the buttons', async () => {
    await benchmark('(baseline) get every button', async () => {
      await $$('.mat-button');
    });
  });

  it('(baseline) should click the first button', async () => {
    await benchmark('(baseline) click first button', async () => {
      await element(by.buttonText(FIRST_BUTTON)).click();
    });
  });

  it('(baseline) should click the middle button', async () => {
    await benchmark('(baseline) click middle button', async () => {
      await element(by.buttonText(MIDDLE_BUTTON)).click();
    });
  });

  it('(baseline) should click the last button', async () => {
    await benchmark('(baseline) click last button', async () => {
      await element(by.buttonText(LAST_BUTTON)).click();
    });
  });

  it('(baseline) should click all of the buttons', async () => {
    await benchmark('(baseline) click every button', async () => {
      const buttons = $$('.mat-button');
      await buttons.each(async button => await button!.click());
    });
  });
});

describe('performance tests for the protractor button harness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await browser.get('');
    loader = ProtractorHarnessEnvironment.loader();
  });

  it('should retrieve all of the buttons', async () => {
    await benchmark('get every button', async () => {
      await loader.getAllHarnesses(MatButtonHarness);
    });
  });

  it('should click the first button', async () => {
    await benchmark('click first button', async () => {
      const button = await loader.getHarness(MatButtonHarness.with({text: FIRST_BUTTON}));
      await button.click();
    });
  });

  it('should click the middle button', async () => {
    await benchmark('click middle button', async () => {
      const button = await loader.getHarness(MatButtonHarness.with({text: MIDDLE_BUTTON}));
      await button.click();
    });
  });

  it('should click the last button', async () => {
    await benchmark('click last button', async () => {
      const button = await loader.getHarness(MatButtonHarness.with({text: LAST_BUTTON}));
      await button.click();
    });
  });

  it('should click all of the buttons', async () => {
    await benchmark('click every button', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        await button.click();
      }
    });
  });
});
