import {runHarnessTests} from './shared.spec';
import {MatSlideToggleModule} from '../index';
import {MatSlideToggleHarness} from './slide-toggle-harness';

describe('MDC-based MatSlideToggleHarness', () => {
  runHarnessTests(MatSlideToggleModule, MatSlideToggleHarness);
});
