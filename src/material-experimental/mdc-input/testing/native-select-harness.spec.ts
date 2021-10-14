import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {runNativeSelectHarnessTests} from '@angular/material/input/testing/shared-native-select.spec';
import {MatNativeSelectHarness} from './index';

describe('MDC-based MatNativeSelectHarness', () => {
  runNativeSelectHarnessTests(MatInputModule, MatNativeSelectHarness);
});
