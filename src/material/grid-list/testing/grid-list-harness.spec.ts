import {MatGridListModule} from '@angular/material/grid-list';
import {MatGridListHarness} from './grid-list-harness';
import {MatGridTileHarness} from './grid-tile-harness';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based MatGridListHarness', () => {
  runHarnessTests(MatGridListModule, MatGridListHarness, MatGridTileHarness);
});
