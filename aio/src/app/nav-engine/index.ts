import { DocService } from './doc.service';
import { DocFetchingService } from './doc-fetching.service';
import { NavEngine } from './nav-engine.service';
import { NavLinkDirective } from './nav-link.directive';
import { NavMapService } from './nav-map.service';

export { Doc, DocMetadata, NavNode, NavMap } from './doc.model';
export { DocMetadataService } from './doc-metadata.service';
export { NavEngine } from './nav-engine.service';
export { NavMapService } from './nav-map.service';

export const navDirectives = [
  NavLinkDirective
];

export const navProviders = [
  DocService,
  DocFetchingService,
  NavEngine,
  NavMapService,
];
