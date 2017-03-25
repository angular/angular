import { Component, Input } from '@angular/core';
import { VersionInfo } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-footer',
  template: `
  <footer>
    <div class="footer">
      <p>Powered by Google ©2010-2017. Code licensed under an <a href="/license">MIT-style License</a>.</p>
      <p>Documentation licensed under <a href="http://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      </p>
      <p class="version-info">Version Info | {{ versionInfo?.full }}</p>
    </div>
  </footer>`
})
export class FooterComponent {
  @Input() versionInfo: VersionInfo;
}

