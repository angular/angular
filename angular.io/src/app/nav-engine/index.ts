import { DocBuilderService } from './doc-builder.service';
import { DocService } from './doc.service';
import { FileService } from './file.service';
import { NavEngine } from './nav-engine.service';
import { NavLinkDirective } from './nav-link.directive';
import { SiteMapService } from './sitemap.service';

export { DocBuilderService } from './doc-builder.service';

export const navDirectives = [
  NavLinkDirective
];

export const navProviders = [
  DocBuilderService,
  DocService,
  FileService,
  NavEngine,
  SiteMapService,
];
