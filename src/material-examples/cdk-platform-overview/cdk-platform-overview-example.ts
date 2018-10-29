import {Component} from '@angular/core';
import {
  getSupportedInputTypes,
  Platform,
  supportsPassiveEventListeners,
  supportsScrollBehavior,
} from '@angular/cdk/platform';

/**
 * @title Platform overview
 */
@Component({
  selector: 'cdk-platform-overview-example',
  templateUrl: 'cdk-platform-overview-example.html',
  styleUrls: ['cdk-platform-overview-example.css'],
})
export class CdkPlatformOverviewExample {
  supportedInputTypes = Array.from(getSupportedInputTypes()).join(', ');
  supportsPassiveEventListeners = supportsPassiveEventListeners();
  supportsScrollBehavior = supportsScrollBehavior();

  constructor(public platform: Platform) {}
}
