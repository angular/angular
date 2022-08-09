import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';
import {MatLegacySliderHarness} from '@angular/material/legacy-slider/testing';

describe('Non-MDC-based MatSliderHarness', () => {
  let fixture: ComponentFixture<SliderHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacySliderModule],
      declarations: [SliderHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all slider harnesses', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(sliders.length).toBe(3);
  });

  it('should load slider harness by id', async () => {
    const sliders = await loader.getAllHarnesses(
      MatLegacySliderHarness.with({selector: '#my-slider'}),
    );
    expect(sliders.length).toBe(1);
  });

  it('should get id of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[0].getId()).toBe(null);
    expect(await sliders[1].getId()).toBe('my-slider');
    expect(await sliders[2].getId()).toBe(null);
  });

  it('should get value of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[0].getValue()).toBe(50);
    expect(await sliders[1].getValue()).toBe(0);
    expect(await sliders[2].getValue()).toBe(225);
  });

  it('should get percentage of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[0].getPercentage()).toBe(0.5);
    expect(await sliders[1].getPercentage()).toBe(0);
    expect(await sliders[2].getPercentage()).toBe(0.5);
  });

  it('should get max value of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[0].getMaxValue()).toBe(100);
    expect(await sliders[1].getMaxValue()).toBe(100);
    expect(await sliders[2].getMaxValue()).toBe(250);
  });

  it('should get min value of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[0].getMinValue()).toBe(0);
    expect(await sliders[1].getMinValue()).toBe(0);
    expect(await sliders[2].getMinValue()).toBe(200);
  });

  it('should get display value of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[0].getDisplayValue()).toBe(null);
    expect(await sliders[1].getDisplayValue()).toBe('Null');
    expect(await sliders[2].getDisplayValue()).toBe('#225');
  });

  it('should get orientation of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[0].getOrientation()).toBe('horizontal');
    expect(await sliders[1].getOrientation()).toBe('horizontal');
    expect(await sliders[2].getOrientation()).toBe('vertical');
  });

  it('should be able to focus slider', async () => {
    // the first slider is disabled.
    const slider = (await loader.getAllHarnesses(MatLegacySliderHarness))[1];
    expect(await slider.isFocused()).toBe(false);
    await slider.focus();
    expect(await slider.isFocused()).toBe(true);
  });

  it('should be able to blur slider', async () => {
    // the first slider is disabled.
    const slider = (await loader.getAllHarnesses(MatLegacySliderHarness))[1];
    expect(await slider.isFocused()).toBe(false);
    await slider.focus();
    expect(await slider.isFocused()).toBe(true);
    await slider.blur();
    expect(await slider.isFocused()).toBe(false);
  });

  it('should be able to set value of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[1].getValue()).toBe(0);
    expect(await sliders[2].getValue()).toBe(225);

    await sliders[1].setValue(33);
    await sliders[2].setValue(300);

    expect(await sliders[1].getValue()).toBe(33);
    // value should be clamped to the maximum.
    expect(await sliders[2].getValue()).toBe(250);
  });

  it('should be able to set value of slider in rtl', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[1].getValue()).toBe(0);
    expect(await sliders[2].getValue()).toBe(225);

    // should not retrieve incorrect values in case slider is inverted
    // due to RTL page layout.
    fixture.componentInstance.dir = 'rtl';
    fixture.detectChanges();

    await sliders[1].setValue(80);
    expect(await sliders[1].getValue()).toBe(80);
  });

  it('should get disabled state of slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[0].isDisabled()).toBe(true);
    expect(await sliders[1].isDisabled()).toBe(false);
    expect(await sliders[2].isDisabled()).toBe(false);
  });

  it('should be able to set value of inverted slider', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[1].getValue()).toBe(0);
    expect(await sliders[2].getValue()).toBe(225);

    fixture.componentInstance.invertSliders = true;
    fixture.detectChanges();

    await sliders[1].setValue(75);
    await sliders[2].setValue(210);

    expect(await sliders[1].getValue()).toBe(75);
    expect(await sliders[2].getValue()).toBe(210);
  });

  it('should be able to set value of inverted slider in rtl', async () => {
    const sliders = await loader.getAllHarnesses(MatLegacySliderHarness);
    expect(await sliders[1].getValue()).toBe(0);
    expect(await sliders[2].getValue()).toBe(225);

    fixture.componentInstance.invertSliders = true;
    fixture.componentInstance.dir = 'rtl';
    fixture.detectChanges();

    await sliders[1].setValue(75);
    await sliders[2].setValue(210);

    expect(await sliders[1].getValue()).toBe(75);
    expect(await sliders[2].getValue()).toBe(210);
  });
});

@Component({
  template: `
    <mat-slider value="50" disabled></mat-slider>
    <div [dir]="dir">
      <mat-slider [id]="sliderId" [displayWith]="displayFn"
                  [invert]="invertSliders" thumbLabel></mat-slider>
    </div>
    <mat-slider min="200" max="250" value="225" [displayWith]="displayFn" vertical
                [invert]="invertSliders" thumbLabel>
    </mat-slider>
    `,
})
class SliderHarnessTest {
  sliderId = 'my-slider';
  invertSliders = false;
  dir = 'ltr';

  displayFn(value: number | null) {
    if (!value) {
      return 'Null';
    }
    return `#${value}`;
  }
}
