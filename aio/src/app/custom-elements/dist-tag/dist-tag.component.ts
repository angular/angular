import { Component, VERSION } from '@angular/core';
import { environment } from 'environments/environment';

/**
 * Display the dist-tag of Angular for installing from npm at the point these docs are generated.
 */
@Component({
  selector: 'aio-angular-dist-tag',
  template: '{{tag}}',
})
export class DistTagComponent {
  tag: string;

  constructor() {
    switch (environment.mode) {
      case 'stable':
        this.tag = '';
        break;
      case 'next':
      case 'rc':
        this.tag = '@next';
        break;
      default:
        this.tag = `@${VERSION.major}`;
    }
  }
}
