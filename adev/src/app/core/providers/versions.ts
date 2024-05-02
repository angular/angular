import { InjectionToken } from "@angular/core";

export interface Version {
  displayName: string;
  version: VersionMode;
  url: string;
}

export type VersionMode = 'stable' | 'rc' | 'next' | 'deprecated';

export interface DocsVersionsMetadata {
  versions: Version[],
  currentVersion: number,
  currentVersionMode: VersionMode
}

export const DOCS_VERSIONS = new InjectionToken<DocsVersionsMetadata>('DOCS_VERSIONS');
