import { NoopAnimationsModule } from '@angular/platform-browser/animations';

export const environment = {
  production: false,
  process: {
    env: {
      // todo(aleksanderbodurri): when devtools is merged into the main angular repo, use stamping tooling to inject the latest SHA into the environment
      LATEST_SHA: '',
    },
  },
  animationModule: NoopAnimationsModule,
};
