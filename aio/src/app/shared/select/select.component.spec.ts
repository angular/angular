import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SelectComponent } from './select.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';

import { MatSelectHarness } from '@angular/material/select/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldHarness } from "@angular/material/form-field/testing";

const options = [
  { title: 'Option A', value: 'option-a' },
  { title: 'Option B', value: 'option-b' }
];

let component: SelectComponent;
let fixture: ComponentFixture<SelectComponent>;

describe('SelectComponent', () => {
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectComponent],
      imports: [MatSelectModule, MatFormFieldModule, NoopAnimationsModule],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
  });

  it('should display the label if provided', async () => {
    const field = await loader.getHarness(MatFormFieldHarness);
    expect((await field.getLabel())).toEqual('');
    component.label = 'Label:';
    fixture.detectChanges();
    expect((await field.getLabel())).toEqual('Label:');
  });

  it('should be disabled if the component is disabled', async () => {
    component.options = options;
    fixture.detectChanges();
    const select = await loader.getHarness(MatSelectHarness);
    expect(await select.isDisabled()).toBe(false);

    component.disabled = true;
    fixture.detectChanges();
    expect(await select.isDisabled()).toBe(true);
  });

  it('should display the selected option, if there is one', async () => {
    component.showSymbol = true;
    component.options = options;
    component.selected = options[0];
    fixture.detectChanges();
    const select = await loader.getHarness(MatSelectHarness);
    expect(await select.getValueText()).toContain(options[0].title);
  });
});
