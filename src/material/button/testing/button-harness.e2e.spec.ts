import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {MatButtonHarness} from '@angular/material/button/testing';
import {browser} from 'protractor';

describe('button harness', () => {
  beforeEach(async () => await browser.get('/button'));

  it('can click button', async () => {
    const loader = ProtractorHarnessEnvironment.loader();
    const disableToggle = await loader.getHarness(MatButtonHarness.with({text: 'Disable buttons'}));
    const testButton = await loader.getHarness(MatButtonHarness.with({selector: '#test-button'}));

    expect(await testButton.isDisabled()).toBe(false);
    await disableToggle.click();
    expect(await testButton.isDisabled()).toBe(true);
  });
});
