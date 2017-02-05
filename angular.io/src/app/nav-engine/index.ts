import { DocService } from './doc.service';
import { FileService } from './file.service';
import { NavEngine } from './nav-engine.service';
import { NavLinkDirective } from './nav-link.directive';
import { SiteMapService } from './sitemap.service';

export { Doc, DocMetadata } from './doc.model';

export const navDirectives = [
  NavLinkDirective
];

export const navProviders = [
  DocService,
  FileService,
  NavEngine,
  SiteMapService,
];
