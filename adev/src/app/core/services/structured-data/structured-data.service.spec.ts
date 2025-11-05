/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {DOCUMENT} from '@angular/core';
import {NavigationItem} from '@angular/docs';

import {STRUCTURED_DATA_SCRIPT_ID, StructuredDataService} from './structured-data.service';
import {StructuredData} from './structured-data.interface';

describe('StructuredDataService', () => {
  let service: StructuredDataService;
  let document: Document;

  beforeEach(() => {
    service = TestBed.inject(StructuredDataService);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    const script = document.getElementById(STRUCTURED_DATA_SCRIPT_ID);
    if (script) {
      script.remove();
    }
  });

  function getStructuredData(): StructuredData {
    const script = document.getElementById(STRUCTURED_DATA_SCRIPT_ID);
    return JSON.parse(script?.textContent || '{}');
  }

  it('should create structured data script element', () => {
    const navigationItem: NavigationItem = {
      label: 'Home',
      path: '',
    };

    service.setStructuredData(navigationItem);

    const script = document.getElementById(STRUCTURED_DATA_SCRIPT_ID);
    expect(script).toBeDefined();
    expect(script!.getAttribute('type')).toBe('application/ld+json');
  });

  it('should set WebApplication structured data', () => {
    const navigationItem: NavigationItem = {
      label: 'Home',
      path: '',
    };

    service.setStructuredData(navigationItem);

    const data = getStructuredData();

    expect(data['@context']).toBe('http://schema.org');
    expect(data['@graph']).toBeDefined();
    expect(data['@graph'].length).toBeGreaterThan(0);

    const webApp = data['@graph'].find((item) => item['@type'] === 'WebApplication');
    expect(webApp).toBeDefined();
  });

  it('should include TechArticle for non-home pages', () => {
    const navigationItem: NavigationItem = {
      label: 'Components',
      path: 'guide/components',
    };

    service.setStructuredData(navigationItem);

    const data = getStructuredData();

    const techArticle = data['@graph'].find((item) => item['@type'] === 'TechArticle');
    expect(techArticle).toBeDefined();
  });

  it('should not include TechArticle for home page', () => {
    const navigationItem: NavigationItem = {
      label: 'Home',
      path: '',
    };

    service.setStructuredData(navigationItem);

    const data = getStructuredData();

    const techArticle = data['@graph'].find((item) => item['@type'] === 'TechArticle');
    expect(techArticle).toBeUndefined();
  });

  it('should include BreadcrumbList when parent has children', () => {
    const navigationItem: NavigationItem = {
      label: 'Components',
      path: 'guide/components',
      parent: {
        label: 'Guide',
        children: [
          {label: 'Introduction', path: 'guide/introduction'},
          {label: 'Components', path: 'guide/components'},
        ],
      },
    };

    service.setStructuredData(navigationItem);

    const data = getStructuredData();

    const breadcrumb = data['@graph'].find((item) => item['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb?.itemListElement).toBeDefined();
    expect(breadcrumb?.itemListElement.length).toBe(2);
  });

  it('should not include BreadcrumbList when parent has no children', () => {
    const navigationItem: NavigationItem = {
      label: 'Components',
      path: 'guide/components',
    };

    service.setStructuredData(navigationItem);

    const data = getStructuredData();

    const breadcrumb = data['@graph'].find((item) => item['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeUndefined();
  });

  it('should not update script when data is the same', () => {
    const navigationItem: NavigationItem = {
      label: 'Components',
      path: 'guide/components',
    };

    service.setStructuredData(navigationItem);

    const firstContent = getStructuredData();

    service.setStructuredData(navigationItem);

    const secondContent = getStructuredData();

    expect(firstContent).toBeDefined();
    expect(secondContent).toBeDefined();

    expect(secondContent).toEqual(firstContent);
  });

  it('should update script when data changes', () => {
    const firstNavItem: NavigationItem = {
      label: 'Components',
      path: 'guide/components',
    };

    service.setStructuredData(firstNavItem);

    const firstContent = getStructuredData();

    const secondNavItem: NavigationItem = {
      label: 'Templates',
      path: 'guide/templates',
    };

    service.setStructuredData(secondNavItem);

    const secondContent = getStructuredData();

    expect(firstContent).toBeDefined();
    expect(secondContent).toBeDefined();
    expect(secondContent).not.toEqual(firstContent);
  });

  it('should reuse existing script element', () => {
    const firstNavItem: NavigationItem = {
      label: 'Components',
      path: 'guide/components',
    };

    service.setStructuredData(firstNavItem);

    const secondNavItem: NavigationItem = {
      label: 'Templates',
      path: 'guide/templates',
    };

    service.setStructuredData(secondNavItem);
    const scripts = document.querySelectorAll(`script[type="application/ld+json"][id="${STRUCTURED_DATA_SCRIPT_ID}"]`);

    expect(scripts.length).toBe(1);
  });
});
