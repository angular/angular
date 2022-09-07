import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {runHarnessTests} from '@angular/material/card/testing/shared.spec';
import {MatLegacyCardHarness, MatLegacyCardSection} from './card-harness';

describe('Non-MDC-based MatCardHarness', () => {
  runHarnessTests(MatLegacyCardModule, MatLegacyCardHarness as any, {
    header: MatLegacyCardSection.HEADER,
    content: MatLegacyCardSection.CONTENT,
    actions: MatLegacyCardSection.ACTIONS,
    footer: MatLegacyCardSection.FOOTER,
  });
});
