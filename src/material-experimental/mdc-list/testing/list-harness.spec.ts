import {MatDividerHarness} from '@angular/material/divider/testing';
import {runHarnessTests} from '@angular/material/list/testing/shared.spec';
import {MatListModule} from '../index';
import {MatActionListHarness} from './action-list-harness';
import {MatListHarness} from './list-harness';
import {
  MatListItemHarnessBase,
  MatListItemSection,
  MatSubheaderHarness,
} from './list-item-harness-base';
import {MatNavListHarness} from './nav-list-harness';
import {MatSelectionListHarness} from './selection-list-harness';

describe('MDC-based list harnesses', () => {
  runHarnessTests(
    MatListModule,
    MatListHarness as any,
    MatActionListHarness as any,
    MatNavListHarness as any,
    MatSelectionListHarness as any,
    MatListItemHarnessBase as any,
    MatSubheaderHarness as any,
    MatDividerHarness,
    {content: MatListItemSection.CONTENT},
  );
});
