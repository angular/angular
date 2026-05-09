/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';

import {BrowserModule, Link} from '../../index';

describe('Link service', () => {
  let doc: Document;
  let linkService: Link;
  let defaultLink: HTMLLinkElement;

  beforeEach(() => {
    doc = getDOM().createHtmlDocument();

    linkService = new Link(doc);

    defaultLink = getDOM().createElement('link', doc) as HTMLLinkElement;
    defaultLink.setAttribute('rel', 'canonical');
    defaultLink.setAttribute('href', 'https://angular.dev');

    doc.getElementsByTagName('head')[0].appendChild(defaultLink);
  });

  afterEach(() => {
    if (defaultLink.parentNode) {
      defaultLink.parentNode.removeChild(defaultLink);
    }
  });

  it('should return link tag matching selector', () => {
    const actual = linkService.getTag('rel="canonical"')!;

    expect(actual).not.toBeNull();
    expect(actual.getAttribute('href')).toEqual('https://angular.dev');
  });

  it('should return all link tags matching selector', () => {
    const link1 = linkService.addTag({
      rel: 'preload',
      href: '/font1.woff2',
    })!;

    const link2 = linkService.addTag({
      rel: 'preload',
      href: '/font2.woff2',
    })!;

    const actual = linkService.getTags('rel="preload"');

    expect(actual.length).toEqual(2);

    expect(actual[0].getAttribute('href')).toEqual('/font1.woff2');
    expect(actual[1].getAttribute('href')).toEqual('/font2.woff2');

    linkService.removeTagElement(link1);
    linkService.removeTagElement(link2);
  });

  it('should return null if link tag does not exist', () => {
    const actual = linkService.getTag('rel="fake"');

    expect(actual).toBeNull();
  });

  it('should remove link tag by the given selector', () => {
    const selector = 'rel="manifest"';

    expect(linkService.getTag(selector)).toBeNull();

    linkService.addTag({
      rel: 'manifest',
      href: '/manifest.webmanifest',
    });

    expect(linkService.getTag(selector)).not.toBeNull();

    linkService.removeTag(selector);

    expect(linkService.getTag(selector)).toBeNull();
  });

  it('should remove link tag by the given element', () => {
    const selector = 'rel="stylesheet"';

    linkService.addTag({
      rel: 'stylesheet',
      href: '/styles.css',
    });

    const link = linkService.getTag(selector)!;

    expect(link).not.toBeNull();

    linkService.removeTagElement(link);

    expect(linkService.getTag(selector)).toBeNull();
  });

  it('should update link tag matching the given selector', () => {
    const selector = 'rel="canonical"';

    linkService.updateTag(
      {
        rel: 'canonical',
        href: 'https://next.angular.dev',
      },
      selector,
    );

    const actual = linkService.getTag(selector)!;

    expect(actual).not.toBeNull();

    expect(actual.getAttribute('href')).toEqual('https://next.angular.dev');
  });

  it('should create link tag if it does not exist', () => {
    const selector = 'rel="manifest"';

    linkService.updateTag(
      {
        rel: 'manifest',
        href: '/manifest.webmanifest',
      },
      selector,
    );

    const actual = linkService.getTag(selector)!;

    expect(actual).not.toBeNull();

    expect(actual.getAttribute('href')).toEqual('/manifest.webmanifest');

    linkService.removeTagElement(actual);
  });

  it('should add new link tag', () => {
    const selector = 'rel="modulepreload"';

    expect(linkService.getTag(selector)).toBeNull();

    linkService.addTag({
      rel: 'modulepreload',
      href: '/main.js',
    });

    const actual = linkService.getTag(selector)!;

    expect(actual).not.toBeNull();

    expect(actual.getAttribute('href')).toEqual('/main.js');

    linkService.removeTagElement(actual);
  });

  it('should add multiple new link tags', () => {
    linkService.addTags([
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'dns-prefetch',
        href: 'https://cdn.example.com',
      },
    ]);

    expect(linkService.getTag('href="https://fonts.googleapis.com"')).not.toBeNull();

    expect(linkService.getTag('href="https://cdn.example.com"')).not.toBeNull();
  });

  it('should not add link tag if it is already present on the page and has the same attributes', () => {
    const selector = 'rel="canonical"';

    expect(linkService.getTags(selector).length).toEqual(1);

    linkService.addTag({
      rel: 'canonical',
      href: 'https://angular.dev',
    });

    expect(linkService.getTags(selector).length).toEqual(1);
  });

  it('should add link tag if it has different attributes', () => {
    const selector = 'rel="canonical"';

    expect(linkService.getTags(selector).length).toEqual(1);

    const link = linkService.addTag({
      rel: 'canonical',
      href: 'https://next.angular.dev',
    })!;

    expect(linkService.getTags(selector).length).toEqual(2);

    linkService.removeTagElement(link);
  });

  it('should add link tag if forceCreation is true', () => {
    const selector = 'rel="canonical"';

    expect(linkService.getTags(selector).length).toEqual(1);

    const link = linkService.addTag(
      {
        rel: 'canonical',
        href: 'https://angular.dev',
      },
      true,
    )!;

    expect(linkService.getTags(selector).length).toEqual(2);

    linkService.removeTagElement(link);
  });

  describe('integration test', () => {
    @Injectable()
    class DependsOnLink {
      constructor(public link: Link) {}
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [BrowserModule],
        providers: [DependsOnLink],
      });
    });

    it('should inject Link service when using BrowserModule', () =>
      expect(TestBed.inject(DependsOnLink).link).toBeInstanceOf(Link));
  });
});
