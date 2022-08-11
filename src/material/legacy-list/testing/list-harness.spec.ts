import {MatDividerHarness} from '@angular/material/divider/testing';
import {MatLegacyListModule} from '@angular/material/legacy-list';
import {MatLegacyActionListHarness} from './action-list-harness';
import {MatLegacyListHarness} from './list-harness';
import {MatLegacyNavListHarness} from './nav-list-harness';
import {MatLegacySelectionListHarness} from './selection-list-harness';
import {
  MatLegacyListItemHarnessBase,
  MatLegacyListItemSection,
  MatLegacySubheaderHarness,
} from './list-item-harness-base';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based list harnesses', () => {
  runHarnessTests(
    MatLegacyListModule,
    MatLegacyListHarness,
    MatLegacyActionListHarness,
    MatLegacyNavListHarness,
    MatLegacySelectionListHarness,
    MatLegacyListItemHarnessBase,
    MatLegacySubheaderHarness,
    MatDividerHarness,
    {content: MatLegacyListItemSection.CONTENT},
  );
});
