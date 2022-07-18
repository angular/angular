import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';

/**
 * Type describing a collection of tags, matching with the objects
 * created by the Dgeni JSDoc processors.
 *
 * https://github.com/angular/dgeni-packages/blob/19e629c0d156572cbea149af9e0cc7ec02db7cb6/jsdoc/lib/TagCollection.js#L4
 */
export interface TagCollection {
  /** List of tags. */
  tags: Tag[];
  /** Map which maps tag names to their tag instances. */
  tagsByName: Map<string, Tag[]>;
  /** List of tags which are unknown, or have errors. */
  badTags: Tag[];
}

/**
 * Type describing a tag, matching with the objects created by the
 * Dgeni JSDoc processors.
 *
 * https://github.com/angular/dgeni-packages/blob/19e629c0d156572cbea149af9e0cc7ec02db7cb6/jsdoc/lib/Tag.js#L1
 */
export interface Tag {
  /** Definition of the tag. Undefined if the tag is unknown. */
  tagDef: undefined | TagDefinition;
  /** Name of the tag (excluding the `@`) */
  tagName: string;
  /** Description associated with the tag. */
  description: string;
  /** Source file line where this tag starts. */
  startingLine: number;
  /** Optional list of errors that have been computed for this tag. */
  errors?: string[];
}

/** Type describing a tag definition for the Dgeni JSDoc processor. */
export interface TagDefinition {
  /** Name of the tag (excluding the `@`) */
  name: string;
  /** Property where the tag information should be attached to. */
  docProperty?: string;
  /** Whether multiple instances of the tag can be used in the same comment. */
  multi?: boolean;
  /** Whether this tag is required for all API documents. */
  required?: boolean;
}

/** Type describing an API doc with JSDoc tag information. */
export type ApiDocWithJsdocTags = ApiDoc & {
  /** Collection of JSDoc tags attached to this API document. */
  tags: TagCollection;
};

/** Whether the specified API document has JSDoc tag information attached. */
export function isApiDocWithJsdocTags(doc: ApiDoc): doc is ApiDocWithJsdocTags {
  return (doc as Partial<ApiDocWithJsdocTags>).tags !== undefined;
}

/** Finds the specified JSDoc tag within the given API doc. */
export function findJsDocTag(doc: ApiDoc, tagName: string): Tag | undefined {
  if (!isApiDocWithJsdocTags(doc)) {
    return undefined;
  }

  return doc.tags.tags.find(t => t.tagName === tagName);
}

/** Gets whether the specified API doc has a given JSDoc tag. */
export function hasJsDocTag(doc: ApiDoc, tagName: string): boolean {
  return findJsDocTag(doc, tagName) !== undefined;
}
