import {bootstrapServiceWorker} from '@angular/service-worker/sdk';
import {Dynamic, ExternalContentCache, FreshnessStrategy, PerformanceStrategy, Push, RouteRedirection, StaticContentCache} from '@angular/service-worker/sdk/plugins';

export function main() {
  bootstrapServiceWorker({
    manifestUrl: 'ngsw-manifest.json',
    plugins: [
      StaticContentCache(),
      Dynamic([
        new FreshnessStrategy(),
        new PerformanceStrategy(),
      ]),
      ExternalContentCache(),
      RouteRedirection(),
      Push(),
    ],
  });
}

main();