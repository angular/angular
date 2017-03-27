import { Component } from '@angular/core';
import { NavigationService } from 'app/navigation/navigation.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/operator/map';

@Component({
  selector: 'aio-footer',
  template: `
  <footer>
    <div class="footer">
      <p>Powered by Google ©2010-2017. Code licensed under an <a href="/license">MIT-style License</a>.</p>
      <p>Documentation licensed under <a href="http://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      </p>
      <p class="version-info">Version Info | {{ version | async }}</p>
    </div>
  </footer>`
})
export class FooterComponent {
  version: Observable<string>;

  constructor(navigationService: NavigationService) {
    this.version = navigationService.versionInfo.map(info => info.full);
  }
}
