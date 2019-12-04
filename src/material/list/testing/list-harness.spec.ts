import {MatDividerHarness} from '@angular/material/divider/testing';
import {MatListModule} from '@angular/material/list';
import {MatActionListHarness} from './action-list-harness';
import {MatListHarness} from './list-harness';
import {MatNavListHarness} from './nav-list-harness';
import {MatSelectionListHarness} from './selection-list-harness';
import {MatListItemHarnessBase, MatSubheaderHarness} from './list-item-harness-base';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based list harnesses', () => {
  runHarnessTests(
      MatListModule, MatListHarness, MatActionListHarness, MatNavListHarness,
      MatSelectionListHarness, MatListItemHarnessBase, MatSubheaderHarness, MatDividerHarness);
});
