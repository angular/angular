/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer} from 'marked';
import {HighlighterGeneric} from 'shiki';
import {codespanRender} from './transformations/code.mjs';
import {headingRender} from './transformations/heading.mjs';
import {imageRender} from './transformations/image.mjs';
import {linkRender} from './transformations/link.mjs';
import {listRender} from './transformations/list.mjs';
import {tableRender} from './transformations/table.mjs';
import {textRender} from './transformations/text.mjs';

export interface RendererContext {
  /**
   * Path of the markdown file being rendered.
   */
  markdownFilePath?: string;
  /**
   * List of guide routes defined in the application.
   */
  definedRoutes?: string[];
  /**
   * Map of API entries available for linking within the rendered markdown file.
   */
  apiEntries?: Record<string, {moduleName: string; aliases?: string[]}>;
  highlighter: HighlighterGeneric<any, any>;
  headerIds: Map<string, number>;
  /** In the case we want to disable auto-linking because anchor blocks might be incompatible where some code blocks are being rendered */
  disableAutoLinking: boolean;
}

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export class AdevDocsRenderer extends Renderer {
  public context: RendererContext;
  constructor(context: Partial<RendererContext>) {
    super();
    if (context.highlighter === undefined) {
      throw Error(
        'An instance of HighlighterGeneric must be provided to the AdevDocsRenderer at construction',
      );
    }
    context.headerIds = context.headerIds || new Map<string, number>();
    this.context = context as RendererContext;
  }

  defaultRenderer = new Renderer();

  isGuideFile(): boolean {
    return this.context.markdownFilePath?.includes('/content/guide') ?? false;
  }

  isKnownRoute(route: string): boolean {
    route = route.startsWith('/') ? route.slice(1) : route;
    route = route.split('?')[0]; // Remove query params

    if (route.startsWith('api/') || route.startsWith('api#')) {
      // Remove fragment for API routes, as we don't have enough info to check them.
      route = route.split('#')[0];
    }
    if (!this.context.definedRoutes?.length) {
      return true;
    }

    if (
      route.startsWith('http') ||
      route.startsWith('#') || // Anchor link within the same page
      route.startsWith('mailto:') || // Should we have a regex to exclude any protocol?
      route.startsWith('playground') ||
      // TODO: Extract routes from the CDK as well
      route.startsWith('api/cdk') ||
      // TODO: Extract routes from Aria as well
      route.startsWith('api/aria') ||
      route.startsWith('tutorials') ||
      route.startsWith('extended-diagnostics')
    ) {
      return true;
    }

    return this.context.definedRoutes.includes(route);
  }

  override link = linkRender;
  override table = tableRender;
  override list = listRender;
  override image = imageRender;
  override text = textRender;
  override heading = headingRender;
  override codespan = codespanRender;
}
