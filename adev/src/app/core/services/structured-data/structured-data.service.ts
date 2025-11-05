/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, DOCUMENT, inject} from '@angular/core';
import {NavigationItem} from '@angular/docs';
import {
  StructuredData,
  BreadcrumbItem,
  BreadcrumbList,
  WebApplication,
  TechArticle,
} from './structured-data.interface';

export const STRUCTURED_DATA_SCRIPT_ID = 'ng-structured-data-script';
const IMAGE = 'https://angular.dev/assets/images/press-kit/angular_wordmark_gradient.png';
const LOGO = 'https://angular.dev/assets/images/press-kit/angular_wordmark_gradient.png';
const SCREEN_SHOT = 'https://angular.dev/assets/images/press-kit/angular_wordmark_gradient.png';

@Injectable({providedIn: 'root'})
export class StructuredDataService {
  private readonly document = inject(DOCUMENT);
  private currentData: string | null = null;

  setStructuredData(navigationItem: NavigationItem): void {
    const documentUrl = new URL(this.document.location.href);

    const baseUrl = `${documentUrl.protocol}//${documentUrl.host}`;

    const url = navigationItem?.path ? `${baseUrl}/${navigationItem.path}` : baseUrl;

    const webApplication: WebApplication = {
      '@type': 'WebApplication',
      name: 'Angular',
      description: 'The web development framework for building modern apps.',
      url,
      image: IMAGE,
      screenshot: SCREEN_SHOT,
      applicationCategory: 'Software Documentation',
      operatingSystem: 'Android, Chrome OS, iOS, iPadOS, macOS, OS X, Linux, Windows',
      author: {
        '@type': 'Organization',
        name: 'Angular',
        description: 'The web development framework for building modern apps.',
        url: 'https://angular.dev',
        logo: LOGO,
      },
    };

    const structuredData: StructuredData = {
      '@context': 'http://schema.org',
      '@graph': [webApplication],
    };

    const techArticle = this.buildTechArticle(navigationItem, url);

    if (techArticle) {
      structuredData['@graph'].push(techArticle);
    }

    const breadcrumbList = this.buildBreadcrumb(navigationItem, baseUrl);

    if (breadcrumbList) {
      structuredData['@graph'].push(breadcrumbList);
    }

    const newData = JSON.stringify(structuredData);

    if (newData === this.currentData) {
      return;
    }

    this.currentData = newData;
    let script = this.document.getElementById(STRUCTURED_DATA_SCRIPT_ID);

    if (!script) {
      script = this.createStructuredDataScript();
    }

    script.textContent = this.currentData;
  }

  private buildBreadcrumb(
    navigationItem: NavigationItem,
    baseUrl: string,
  ): BreadcrumbList | undefined {
    const children = navigationItem?.parent?.children;
    if (!children || children?.length === 0) {
      return undefined;
    }

    const itemListElement = children.map((child, index) => {
      const childPath = child.path || child?.children?.[0]?.path;

      const item = `${baseUrl}/${childPath}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: child.label || '',
        item,
      } satisfies BreadcrumbItem;
    });

    return {
      '@type': 'BreadcrumbList',
      itemListElement,
    };
  }

  private buildTechArticle(navigationItem: NavigationItem, url: string): TechArticle | undefined {
    const title = navigationItem.label;
    if (!title) {
      return;
    }

    // Do not emit TechArticle for the home page
    const isHome = title === 'Home';
    if (isHome) {
      return;
    }

    return {
      '@type': 'TechArticle',
      headline: title,
      inLanguage: 'en-US',
      mainEntityOfPage: url,
    };
  }

  private createStructuredDataScript() {
    const script = this.document.createElement('script');
    script.id = STRUCTURED_DATA_SCRIPT_ID;
    script.type = 'application/ld+json';
    this.document.head.appendChild(script);
    return script;
  }
}
