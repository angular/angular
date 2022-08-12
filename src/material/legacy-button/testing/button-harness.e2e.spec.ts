import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {MatLegacyButtonHarness} from '@angular/material/legacy-button/testing';
import {browser} from 'protractor';

describe('button harness', () => {
  beforeEach(async () => await browser.get('/button'));

  it('can click button', async () => {
    const loader = ProtractorHarnessEnvironment.loader();
    const disableToggle = await loader.getHarness(
      MatLegacyButtonHarness.with({text: 'Disable buttons'}),
    );
    const testButton = await loader.getHarness(
      MatLegacyButtonHarness.with({selector: '#test-button'}),
    );

    expect(await testButton.isDisabled()).toBe(false);
    await disableToggle.click();
    expect(await testButton.isDisabled()).toBe(true);
  });
});
