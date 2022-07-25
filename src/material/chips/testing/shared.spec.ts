import {Component} from '@angular/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {HarnessLoader, parallel, TestKey} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '@angular/material/chips';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatIconHarness} from '@angular/material/icon/testing';
import {MatChipListHarness} from './chip-list-harness';
import {MatChipHarness} from './chip-harness';
import {MatChipInputHarness} from './chip-input-harness';
import {MatChipRemoveHarness} from './chip-remove-harness';
import {MatChipOptionHarness} from './chip-option-harness';
import {MatChipListboxHarness} from './chip-listbox-harness';

/** Shared tests to run on both the original and MDC-based chips. */
export function runHarnessTests(
  chipsModule: typeof MatChipsModule,
  chipListHarness: typeof MatChipListHarness,
  listboxHarness: typeof MatChipListboxHarness,
  chipHarness: typeof MatChipHarness,
  chipOptionHarness: typeof MatChipOptionHarness,
  chipInputHarness: typeof MatChipInputHarness,
  chipRemoveHarness: typeof MatChipRemoveHarness,
  iconModule: typeof MatIconModule,
  iconHarness: typeof MatIconHarness,
) {
  let fixture: ComponentFixture<ChipsHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [chipsModule, MatLegacyFormFieldModule, NoopAnimationsModule, iconModule],
      declarations: [ChipsHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipsHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load the harnesses for a chip list', async () => {
    const chipLists = await loader.getAllHarnesses(chipListHarness);
    expect(chipLists.length).toBe(3);
  });

  it('should get whether a chip list is disabled', async () => {
    const chipLists = await loader.getAllHarnesses(chipListHarness);

    expect(await parallel(() => chipLists.map(list => list.isDisabled()))).toEqual([
      false,
      false,
      false,
    ]);

    fixture.componentInstance.isDisabled = true;
    fixture.detectChanges();

    expect(await parallel(() => chipLists.map(list => list.isDisabled()))).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('should get whether a chip list is required', async () => {
    const chipLists = await loader.getAllHarnesses(chipListHarness);

    expect(await parallel(() => chipLists.map(list => list.isRequired()))).toEqual([
      false,
      false,
      true,
    ]);

    fixture.componentInstance.isRequired = true;
    fixture.detectChanges();

    expect(await parallel(() => chipLists.map(list => list.isRequired()))).toEqual([
      true,
      false,
      true,
    ]);
  });

  it('should get whether a chip list is in multi-selection mode', async () => {
    const chipLists = await loader.getAllHarnesses(chipListHarness);

    expect(await parallel(() => chipLists.map(list => list.isMultiple()))).toEqual([
      false,
      false,
      false,
    ]);

    fixture.componentInstance.isMultiple = true;
    fixture.detectChanges();

    expect(await parallel(() => chipLists.map(list => list.isMultiple()))).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('should get the orientation of a chip list', async () => {
    const chipLists = await loader.getAllHarnesses(chipListHarness);

    expect(await parallel(() => chipLists.map(list => list.getOrientation()))).toEqual([
      'horizontal',
      'horizontal',
      'horizontal',
    ]);

    fixture.componentInstance.orientation = 'vertical';
    fixture.detectChanges();

    expect(await parallel(() => chipLists.map(list => list.getOrientation()))).toEqual([
      'vertical',
      'horizontal',
      'horizontal',
    ]);
  });

  it('should get the chips in a chip list', async () => {
    const chipLists = await loader.getAllHarnesses(chipListHarness);
    const chips = await parallel(() => chipLists.map(list => list.getChips()));
    expect(chips.map(list => list.length)).toEqual([4, 0, 2]);
  });

  it('should be able to get the input associated with a chip list', async () => {
    const chipLists = await loader.getAllHarnesses(chipListHarness);
    expect(await chipLists[2].getInput()).toBeTruthy();
  });

  it('should be able to get the selected chips in a list', async () => {
    const chipList = await loader.getHarness(listboxHarness);
    const chips = await chipList.getChips();

    expect((await chipList.getChips({selected: true})).length).toBe(0);
    await chips[1].select();

    const selectedChips = await chipList.getChips({selected: true});
    expect(await parallel(() => selectedChips.map(chip => chip.getText()))).toEqual(['Chip 2']);
  });

  it('should be able to select chips based on a filter', async () => {
    const chipList = await loader.getHarness(listboxHarness);
    fixture.componentInstance.isMultiple = true;

    expect((await chipList.getChips({selected: true})).length).toBe(0);
    await chipList.selectChips({text: /^Chip (2|4)$/});

    const selectedChips = await chipList.getChips({selected: true});
    expect(await parallel(() => selectedChips.map(chip => chip.getText()))).toEqual([
      'Chip 2',
      'Chip 4',
    ]);
  });

  it('should the load the harnesses for chips', async () => {
    const chips = await loader.getAllHarnesses(chipHarness);
    expect(chips.length).toBe(6);
  });

  it('should get the text of a chip', async () => {
    const chips = await loader.getAllHarnesses(chipHarness);
    expect(await parallel(() => chips.map(chip => chip.getText()))).toEqual([
      'Chip 1',
      'Chip 2',
      'Chip 3',
      'Chip 4',
      'Frodo',
      'Bilbo',
    ]);
  });

  it('should be able to select a chip', async () => {
    const chip = await loader.getHarness(chipOptionHarness);
    expect(await chip.isSelected()).toBe(false);
    await chip.select();
    expect(await chip.isSelected()).toBe(true);
  });

  it('should be able to deselect a chip', async () => {
    const chip = await loader.getHarness(chipOptionHarness);
    await chip.select();
    expect(await chip.isSelected()).toBe(true);
    await chip.deselect();
    expect(await chip.isSelected()).toBe(false);
  });

  it('should be able to toggle the selected state of a chip', async () => {
    const chip = await loader.getHarness(chipOptionHarness);
    expect(await chip.isSelected()).toBe(false);
    await chip.toggle();
    expect(await chip.isSelected()).toBe(true);
    await chip.toggle();
    expect(await chip.isSelected()).toBe(false);
  });

  it('should get the disabled state of a chip', async () => {
    const chips = await loader.getAllHarnesses(chipHarness);
    expect(await parallel(() => chips.map(chip => chip.isDisabled()))).toEqual([
      false,
      false,
      true,
      false,
      false,
      false,
    ]);
  });

  it('should get the selected state of a chip', async () => {
    const chips = await loader.getAllHarnesses(chipOptionHarness);
    expect(await parallel(() => chips.map(chip => chip.isSelected()))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
    ]);

    await chips[1].select();

    expect(await parallel(() => chips.map(chip => chip.isSelected()))).toEqual([
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
  });

  it('should be able to trigger chip removal', async () => {
    const chip = await loader.getHarness(chipHarness);
    expect(fixture.componentInstance.remove).not.toHaveBeenCalled();
    await chip.remove();
    expect(fixture.componentInstance.remove).toHaveBeenCalled();
  });

  it('should the load the harnesses for chip inputs', async () => {
    const inputs = await loader.getAllHarnesses(chipInputHarness);
    expect(inputs.length).toBe(1);
  });

  it('should get whether the chip input is disabled', async () => {
    const input = await loader.getHarness(chipInputHarness);
    expect(await input.isDisabled()).toBe(false);
    fixture.componentInstance.inputDisabled = true;
    expect(await input.isDisabled()).toBe(true);
  });

  it('should get whether the chip input is required', async () => {
    const input = await loader.getHarness(chipInputHarness);
    expect(await input.isRequired()).toBe(false);
    fixture.componentInstance.inputRequired = true;
    expect(await input.isRequired()).toBe(true);
  });

  it('should focus a chip input', async () => {
    const input = await loader.getHarness(chipInputHarness);
    expect(await input.isFocused()).toBe(false);
    await input.focus();
    expect(await input.isFocused()).toBe(true);
  });

  it('should blur a chip input', async () => {
    const input = await loader.getHarness(chipInputHarness);
    await input.focus();
    expect(await input.isFocused()).toBe(true);
    await input.blur();
    expect(await input.isFocused()).toBe(false);
  });

  it('should get the chip input placeholder', async () => {
    const input = await loader.getHarness(chipInputHarness);
    expect(await input.getPlaceholder()).toBe('Enter a hobbit');
  });

  it('should be able to set the chip input value', async () => {
    const input = await loader.getHarness(chipInputHarness);
    expect(await input.getValue()).toBe('');
    await input.setValue('Hello');
    expect(await input.getValue()).toBe('Hello');
  });

  it('should be able to dispatch a separator key from the input harness', async () => {
    const input = await loader.getHarness(chipInputHarness);
    await input.setValue('Hello');
    await input.sendSeparatorKey(TestKey.ENTER);
    expect(fixture.componentInstance.add).toHaveBeenCalled();
  });

  it('should get the chip remove button', async () => {
    const formFieldChip = await loader.getHarness(chipHarness.with({ancestor: 'mat-form-field'}));
    expect(await formFieldChip.getRemoveButton()).toBeTruthy();
  });

  it('should be able to trigger removal through the remove button', async () => {
    const removeButton = await loader.getHarness(chipRemoveHarness);
    expect(fixture.componentInstance.remove).not.toHaveBeenCalled();
    await removeButton.click();
    expect(fixture.componentInstance.remove).toHaveBeenCalled();
  });

  it('should find avatar in chip', async () => {
    const chip = await loader.getHarness(
      chipHarness.with({
        selector: '.mat-chip-with-avatar',
      }),
    );
    const avatar = await chip.getAvatar();
    expect(avatar).toBeTruthy();
    const avatarHost = await avatar?.host();
    expect(await avatarHost?.getAttribute('aria-label')).toBe('Coronavirus');
  });

  it('should find icon in chip', async () => {
    const chip = await loader.getHarness(
      chipHarness.with({
        selector: '.mat-chip-with-icon-avatar',
      }),
    );
    expect(chip).toBeTruthy();
    const icon = await chip.getHarness(iconHarness);
    expect(icon).toBeTruthy();
    expect(await icon.getName()).toBe('coronavirus');
  });
}

@Component({
  template: `
    <mat-chip-list
      [disabled]="isDisabled"
      [required]="isRequired"
      [multiple]="isMultiple"
      [aria-orientation]="orientation">
      <mat-chip (removed)="remove()">Chip 1</mat-chip>
      <mat-chip (removed)="remove()">Chip 2 <span matChipRemove>remove_icon</span></mat-chip>
      <mat-chip
        disabled
        (removed)="remove()">
        Chip 3
        <span matChipTrailingIcon>trailing_icon</span>
      </mat-chip>
      <mat-chip class="mat-chip-with-icon-avatar" (removed)="remove()">
        <mat-icon matChipAvatar aria-label="Coronavirus" aria-hidden="false">coronavirus</mat-icon>
        Chip 4
      </mat-chip>
    </mat-chip-list>

    <mat-chip-list></mat-chip-list>

    <mat-form-field>
      <mat-chip-list #chipList required>
        <mat-chip (removed)="remove()">
          Frodo
          <button matChipRemove></button>
        </mat-chip>

        <mat-chip (removed)="remove()">
          Bilbo
          <button matChipRemove></button>
        </mat-chip>
      </mat-chip-list>

      <input
        placeholder="Enter a hobbit"
        [matChipInputFor]="chipList"
        [disabled]="inputDisabled"
        [required]="inputRequired"
        (matChipInputTokenEnd)="add()"/>
    </mat-form-field>
  `,
})
class ChipsHarnessTest {
  isDisabled = false;
  isRequired = false;
  isMultiple = false;
  orientation = 'horizontal';
  inputDisabled = false;
  inputRequired = false;
  remove = jasmine.createSpy('remove spy');
  add = jasmine.createSpy('add spy');
}
