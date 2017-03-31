import { Component, Input } from '@angular/core';

import { NavigationNode, VersionInfo } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-footer',
  templateUrl: 'footer.component.html'
})
export class FooterComponent {
  @Input() nodes: NavigationNode[];
  @Input() versionInfo: VersionInfo;
}
