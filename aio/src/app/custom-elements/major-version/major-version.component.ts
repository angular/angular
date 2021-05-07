import { Component, VERSION } from '@angular/core';

/**
 * Display the major version of Angular at the point these docs are generated.
 */
@Component({
  selector: 'aio-major-version',
  template: '{{version}}',
})
export class MajorVersionComponent {
  version = /rc|next/.test(VERSION.patch) ? 'next' : `${VERSION.major}`;
}
