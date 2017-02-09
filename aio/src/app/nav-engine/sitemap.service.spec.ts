import { fakeAsync, tick } from '@angular/core/testing';
import { DocMetadata } from './doc.model';
import { SiteMapService } from './sitemap.service';

describe('SiteMapService', () => {
  let siteMapService: SiteMapService;

  beforeEach(() => {
    siteMapService = new SiteMapService();
  });

  it('should get News metadata', fakeAsync(() => {
    siteMapService.getDocMetadata('news').subscribe(
      metadata => expect(metadata.url).toBe('content/news.html')
    );
    tick();
  }));

  it('should calculate expected doc url for unknown id', fakeAsync(() => {
    siteMapService.getDocMetadata('fizbuz').subscribe(
      metadata => expect(metadata.url).toBe('content/fizbuz.html')
    );
    tick();
  }));

  it('should calculate expected index doc url for unknown id ending in /', fakeAsync(() => {
    siteMapService.getDocMetadata('fizbuz/').subscribe(
      metadata => expect(metadata.url).toBe('content/fizbuz/index.html')
    );
    tick();
  }));
});
