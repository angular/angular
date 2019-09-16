import {Platform, PlatformModule} from '@angular/cdk/platform';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing/button-harness';

/** Shared tests to run on both the original and MDC-based buttons. */
export function runHarnessTests(
    buttonModule: typeof MatButtonModule, buttonHarness: typeof MatButtonHarness) {
  let fixture: ComponentFixture<ButtonHarnessTest>;
  let loader: HarnessLoader;
  let platform: Platform;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [buttonModule, PlatformModule],
      declarations: [ButtonHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  beforeEach(inject([Platform], (p: Platform) => {
    platform = p;
  }));

  it('should load all button harnesses', async () => {
    const buttons = await loader.getAllHarnesses(buttonHarness);
    expect(buttons.length).toBe(14);
  });

  it('should load button with exact text', async () => {
    const buttons = await loader.getAllHarnesses(buttonHarness.with({text: 'Basic button'}));
    expect(buttons.length).toBe(1);
    expect(await buttons[0].getText()).toBe('Basic button');
  });

  it('should load button with regex label match', async () => {
    const buttons = await loader.getAllHarnesses(buttonHarness.with({text: /basic/i}));
    expect(buttons.length).toBe(2);
    expect(await buttons[0].getText()).toBe('Basic button');
    expect(await buttons[1].getText()).toBe('Basic anchor');
  });

  it('should get disabled state', async () => {
    // Grab each combination of [enabled, disabled] ⨯ [button, anchor]
    const [disabledFlatButton, enabledFlatAnchor] =
        await loader.getAllHarnesses(buttonHarness.with({text: /flat/i}));
    const [enabledRaisedButton, disabledRaisedAnchor] =
        await loader.getAllHarnesses(buttonHarness.with({text: /raised/i}));

    expect(await enabledFlatAnchor.isDisabled()).toBe(false);
    expect(await disabledFlatButton.isDisabled()).toBe(true);
    expect(await enabledRaisedButton.isDisabled()).toBe(false);
    expect(await disabledRaisedAnchor.isDisabled()).toBe(true);
  });

  it('should get button text', async () => {
    const [firstButton, secondButton] = await loader.getAllHarnesses(buttonHarness);
    expect(await firstButton.getText()).toBe('Basic button');
    expect(await secondButton.getText()).toBe('Flat button');
  });

  it('should focus and blur a button', async () => {
    const button = await loader.getHarness(buttonHarness.with({text: 'Basic button'}));
    expect(getActiveElementId()).not.toBe('basic');
    await button.focus();
    expect(getActiveElementId()).toBe('basic');
    await button.blur();
    expect(getActiveElementId()).not.toBe('basic');
  });

  it('should click a button', async () => {
    const button = await loader.getHarness(buttonHarness.with({text: 'Basic button'}));
    await button.click();

    expect(fixture.componentInstance.clicked).toBe(true);
  });

  it('should not click a disabled button', async () => {
    // Older versions of Edge have a bug where `disabled` buttons are still clickable if
    // they contain child elements. We skip this check on Edge.
    // See https://stackoverflow.com/questions/32377026/disabled-button-is-clickable-on-edge-browser
    if (platform.EDGE) {
      return;
    }

    const button = await loader.getHarness(buttonHarness.with({text: 'Flat button'}));
    await button.click();

    expect(fixture.componentInstance.clicked).toBe(false);
  });
}

function getActiveElementId() {
  return document.activeElement ? document.activeElement.id : '';
}

@Component({
  // Include one of each type of button selector to ensure that they're all captured by
  // the harness's selector.
  template: `
    <button id="basic" type="button" mat-button (click)="clicked = true">
      Basic button
    </button>
    <button id="flat" type="button" mat-flat-button disabled (click)="clicked = true">
      Flat button
    </button>
    <button id="raised" type="button" mat-raised-button>Raised button</button>
    <button id="stroked" type="button" mat-stroked-button>Stroked button</button>
    <button id="icon" type="button" mat-icon-button>Icon button</button>
    <button id="fab" type="button" mat-fab>Fab button</button>
    <button id="mini-fab" type="button" mat-mini-fab>Mini Fab button</button>

    <a id="anchor-basic" mat-button>Basic anchor</a>
    <a id="anchor-flat" mat-flat-button>Flat anchor</a>
    <a id="anchor-raised" mat-raised-button disabled>Raised anchor</a>
    <a id="anchor-stroked" mat-stroked-button>Stroked anchor</a>
    <a id="anchor-icon" mat-icon-button>Icon anchor</a>
    <a id="anchor-fab" mat-fab>Fab anchor</a>
    <a id="anchor-mini-fab" mat-mini-fab>Mini Fab anchor</a>
  `
})
class ButtonHarnessTest {
  disabled = true;
  clicked = false;
}

