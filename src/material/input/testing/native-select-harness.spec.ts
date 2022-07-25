import {MatInputModule} from '@angular/material/input';
import {runNativeSelectHarnessTests} from './shared-native-select.spec';
import {MatNativeSelectHarness} from './native-select-harness';

describe('MDC-based MatNativeSelectHarness', () => {
  runNativeSelectHarnessTests(MatInputModule, MatNativeSelectHarness);
});
