import { Component, Input } from '@angular/core';

import { NavigationNode, VersionInfo } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-footer',
  templateUrl: 'footer.component.html'
})
export class FooterComponent {
  @Input() nodes: NavigationNode[];
  @Input() versionInfo: VersionInfo;

  async downloadDocs(){
    try {
      const manifest = await fetch('ngsw.json').then(res => res.json());
      const lazyUrls = manifest.assetGroups.find((g:any) => g.name === 'docs-lazy').urls;
      const confirmed = confirm(`Download all ${lazyUrls.length} URLs?`);

      if (confirmed) {
        const start = performance.now();
        const responses = await Promise.all(lazyUrls.map((u:any) => fetch(u)));
        const failed = responses.filter((r:any) => !r.ok);
        const failedCount = failed.length;
        const duration = Math.round((performance.now() - start) / 1000);
        failed.forEach((failure:any)=> console.log(`Failed to fetch ${failure.url}.`))
        alert(`Downloaded ${lazyUrls.length} URLs in ${duration}s. (${failedCount} failed.)`);
      }
    } catch (err) {
      console.error(err);
      alert(`An error occurred:\n\n${err.stack}`);
    }
  }
}
