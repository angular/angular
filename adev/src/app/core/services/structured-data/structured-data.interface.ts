/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * JSON-LD structured data for SEO and rich results.
 *
 * Represents schema.org types emitted by the site for search engine optimization.
 *
 * @see {@link https://www.w3.org/TR/json-ld11 | JSON-LD 1.1 Specification}
 * @see {@link https://schema.org/ | Schema.org Documentation}
 * @see {@link https://developers.google.com/search/docs/appearance/structured-data | Google Structured Data Guide}
 *
 * @example
 * ```json
 * {
 *   "@context": "http://schema.org",
 *   "@graph": [
 *     { "@type": "WebApplication", "name": "Angular", "url": "https://angular.dev" },
 *     { "@type": "TechArticle", "headline": "Guide", "inLanguage": "en-US", "mainEntityOfPage": "https://angular.dev/guide" },
 *     { "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Guide", "item": "https://angular.dev/guide" }] }
 *   ]
 * }
 * ```
 */
export interface StructuredData {
  /** JSON-LD context (always http://schema.org for our usage) */
  '@context': 'http://schema.org';

  /** The graph containing the specific typed nodes we emit (WebApplication, TechArticle, BreadcrumbList). */
  '@graph': (BreadcrumbList | WebApplication | TechArticle)[];
}

/**
 * TechArticle
 * See: https://schema.org/TechArticle
 *
 * Minimal properties used by the site. Additional fields from the schema are
 * intentionally omitted; add them here if the page emits them.
 */
export interface TechArticle {
  '@type': 'TechArticle';
  headline: string;
  // TODO: find a way to include description
  // description?: string;
  inLanguage: string;
  mainEntityOfPage: string;
  // TODO: We can consider adding this fields ?
  // datePublished?: string;
  // dateModified?: string;
}

/**
 * See: https://schema.org/WebApplication
 *
 * Represents the product/site itself. We include basic branding metadata
 * (name, url, image, author) to help search engines understand the site.
 */
export interface WebApplication {
  '@type': 'WebApplication';
  name: string;
  description: string;
  url: string;
  image: string;
  screenshot: string;
  applicationCategory: string;
  operatingSystem: string;
  author: {
    '@type': 'Organization';
    name: string;
    description: string;
    url: string;
    logo: string;
  };
}

/**
 * BreadcrumbList
 * See: https://schema.org/BreadcrumbList
 *
 * Breadcrumbs help search engines display hierarchical navigation for the
 * current page. `itemListElement` is an ordered list of `ListItem` nodes.
 */
export interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

/**
 * ListItem (Breadcrumb entry)
 * See: https://schema.org/ListItem
 */
export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string; // URL for the breadcrumb entry
}
