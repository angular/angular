import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTooltipHarness} from '@angular/material/tooltip/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

/** Shared tests to run on both the original and MDC-based tooltips. */
export function runHarnessTests(
  tooltipModule: typeof MatTooltipModule,
  tooltipHarness: typeof MatTooltipHarness,
) {
  let fixture: ComponentFixture<TooltipHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [tooltipModule, NoopAnimationsModule],
      declarations: [TooltipHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all tooltip harnesses', async () => {
    const tooltips = await loader.getAllHarnesses(tooltipHarness);
    expect(tooltips.length).toBe(2);
  });

  it('should be able to show a tooltip', async () => {
    const tooltip = await loader.getHarness(tooltipHarness.with({selector: '#one'}));
    expect(await tooltip.isOpen()).toBe(false);
    await tooltip.show();
    expect(await tooltip.isOpen()).toBe(true);
  });

  it('should be able to hide a tooltip', async () => {
    const tooltip = await loader.getHarness(tooltipHarness.with({selector: '#one'}));
    expect(await tooltip.isOpen()).toBe(false);
    await tooltip.show();
    expect(await tooltip.isOpen()).toBe(true);
    await tooltip.hide();
    expect(await tooltip.isOpen()).toBe(false);
  });

  it('should be able to get the text of a tooltip', async () => {
    const tooltip = await loader.getHarness(tooltipHarness.with({selector: '#one'}));
    await tooltip.show();
    expect(await tooltip.getTooltipText()).toBe('Tooltip message');
  });

  it('should return empty when getting the tooltip text while closed', async () => {
    const tooltip = await loader.getHarness(tooltipHarness.with({selector: '#one'}));
    expect(await tooltip.getTooltipText()).toBe('');
  });
}

@Component({
  template: `
    <button [matTooltip]="message" id="one">Trigger 1</button>
    <button matTooltip="Static message" id="two">Trigger 2</button>
  `,
})
class TooltipHarnessTest {
  message = 'Tooltip message';
}
