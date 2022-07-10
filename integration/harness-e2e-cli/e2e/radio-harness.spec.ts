import {MatRadioGroupHarness} from '@angular/material/radio/testing';
import {SeleniumWebDriverHarnessEnvironment} from '@angular/cdk/testing/selenium-webdriver';
import {HarnessLoader} from '@angular/cdk/testing';
import {configureDriver} from './driver.js';

// Tests are flaky on CI unless we increase the timeout.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10_000; // 10 seconds

describe('app test', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    const driver = await configureDriver();

    await driver.get('http://localhost:4200');

    loader = SeleniumWebDriverHarnessEnvironment.loader(driver);
  });

  it('should work', async () => {
    const group = await loader.getHarness(MatRadioGroupHarness);

    expect(group).toBeDefined();
    expect(await group.getCheckedValue()).toBe(null);

    const buttons = await group.getRadioButtons();
    await buttons[1].check();

    expect(await group.getCheckedValue()).toBe('second');
  });
});
