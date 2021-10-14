import {MatChipsModule} from '@angular/material/chips';
import {runHarnessTests} from '@angular/material/chips/testing/shared.spec';
import {MatIconModule} from '@angular/material/icon';
import {MatIconHarness} from '@angular/material/icon/testing';
import {MatChipListHarness} from './chip-list-harness';
import {MatChipHarness} from './chip-harness';
import {MatChipInputHarness} from './chip-input-harness';
import {MatChipRemoveHarness} from './chip-remove-harness';
import {MatChipListboxHarness} from './chip-listbox-harness';
import {MatChipOptionHarness} from './chip-option-harness';

describe('Non-MDC-based MatChipListHarness', () => {
  runHarnessTests(
    MatChipsModule,
    MatChipListHarness,
    MatChipListboxHarness,
    MatChipHarness,
    MatChipOptionHarness,
    MatChipInputHarness,
    MatChipRemoveHarness,
    MatIconModule,
    MatIconHarness,
  );
});
