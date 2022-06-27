import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {runHarnessTests} from '@angular/material/legacy-card/testing/shared.spec';
import {MatLegacyCardHarness, MatLegacyCardSection} from './card-harness';

describe('Non-MDC-based MatCardHarness', () => {
  runHarnessTests(MatLegacyCardModule, MatLegacyCardHarness, {
    header: MatLegacyCardSection.HEADER,
    content: MatLegacyCardSection.CONTENT,
    actions: MatLegacyCardSection.ACTIONS,
    footer: MatLegacyCardSection.FOOTER,
  });
});
