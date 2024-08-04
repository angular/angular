import {JsDocTagEntry, MemberEntry, ParameterEntry} from '../entities';

import {
  CodeLineRenderable,
  JsDocTagRenderable,
  LinkEntryRenderable,
  MemberEntryRenderable,
  ParameterEntryRenderable,
} from './renderables';

/** A doc entry that has jsdoc tags. */
export interface HasJsDocTags {
  jsdocTags: JsDocTagEntry[];
}

export interface HasAdditionalLinks {
  additionalLinks: LinkEntryRenderable[];
}

/** A doc entry that has jsdoc tags transformed for rendering. */
export interface HasRenderableJsDocTags {
  jsdocTags: JsDocTagRenderable[];
}

/** A doc entry that has a description. */
export interface HasDescription {
  description: string;
}

/** A doc entry that has a transformed html description. */
export interface HasHtmlDescription {
  htmlDescription: string;
  shortHtmlDescription: string;
}

/** A doc entry that has a usage notes. */
export interface HasUsageNotes {
  usageNotes: string;
}

/** A doc entry that has a transformed html usage notes. */
export interface HasHtmlUsageNotes {
  htmlUsageNotes: string;
}

/** A doc entry that has members transformed for rendering. */
export interface HasMembers {
  members: MemberEntry[];
}

/** A doc entry that has members groups transformed for rendering. */
export interface HasRenderableMembersGroups {
  membersGroups: Map<string, MemberEntryRenderable[]>;
}

/** A doc entry that has members transformed for rendering. */
export interface HasRenderableMembers {
  members: MemberEntryRenderable[];
}

/** A doc entry that has an associated JS module name. */
export interface HasModuleName {
  moduleName: string;
}

/** A doc entry that has ToC transformed for rendering. */
export interface HasRenderableToc {
  beforeCodeGroups: string;
  codeLinesGroups: Map<string, CodeLineRenderable[]>;
  afterCodeGroups: string;
}

/** A doc entry that has params transformed for rendering. */
export interface HasParams {
  params: ParameterEntry[];
}

/** A doc entry that has params for rendering. */
export interface HasRenderableParams {
  params: ParameterEntryRenderable[];
}

export interface HasDeprecatedFlag {
  isDeprecated: boolean;
  deprecationMessage: string | null;
}

export interface HasDeveloperPreviewFlag {
  isDeveloperPreview: boolean;
}

export interface hasExperimentalFlag {
  isExperimental: boolean;
}
