import {MatInputModule} from '@angular/material/input';
import {MatNativeSelectHarness} from './native-select-harness';
import {runNativeSelectHarnessTests} from './shared-native-select.spec';

describe('Non-MDC-based MatNativeSelectHarness', () => {
  runNativeSelectHarnessTests(MatInputModule, MatNativeSelectHarness);
});
