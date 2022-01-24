import {MatSelectHarness} from '@angular/material/select/testing';
import {SeleniumWebDriverHarnessEnvironment} from '@angular/cdk/testing/selenium-webdriver';
import {HarnessLoader} from '@angular/cdk/testing';
import {configureDriver} from './driver.js';

describe('app test', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    const driver = await configureDriver();

    await driver.get('http://localhost:4200');

    loader = SeleniumWebDriverHarnessEnvironment.loader(driver);
  });

  it('should work', async () => {
    const select = await loader.getHarness(MatSelectHarness);

    expect(select).toBeDefined();
    expect(await select.getValueText()).toBe('');

    await select.open();

    const options = await select.getOptions();

    await options[0].click();
    await select.close();

    expect(await select.getValueText()).toBe('First');
  });
});
