/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule, Link} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

{
  describe('Link service', () => {
    let doc: Document;
    let linkService: Link;
    let defaultLink: HTMLLinkElement;

    beforeEach(() => {
      doc = getDOM().createHtmlDocument();
      linkService = new Link(doc);
      defaultLink = getDOM().createElement('link', doc) as HTMLLinkElement;
      defaultLink.setAttribute('rel', 'canonical');
      defaultLink.setAttribute('href', 'https://example.com');
      doc.getElementsByTagName('head')[0].appendChild(defaultLink);
    });

    afterEach(() => getDOM().remove(defaultLink));

    it('should return link tag matching selector', () => {
      const actual: HTMLLinkElement = linkService.getLink('rel="canonical"') !;
      expect(actual).not.toBeNull();
      expect(actual.getAttribute('href')).toEqual('https://example.com');
    });

    it('should return all link tags matching selector', () => {
      const tag1 = linkService.addLink({rel: 'stylesheet', href: 'http://foo.bar'}) !;
      const tag2 = linkService.addLink({rel: 'stylesheet', href: 'http://bar.baz'}) !;

      const actual: HTMLLinkElement[] = linkService.getLinks('rel=stylesheet');
      expect(actual.length).toEqual(2);
      expect(actual[0].getAttribute('href')).toEqual('http://foo.bar');
      expect(actual[1].getAttribute('href')).toEqual('http://bar.baz');

      // clean up
      linkService.removeLinkElement(tag1);
      linkService.removeLinkElement(tag2);
    });

    it('should return null if link tag does not exist', () => {
      const actual: HTMLLinkElement = linkService.getLink('fake=fake') !;
      expect(actual).toBeNull();
    });

    it('should remove link tag by the given selector', () => {
      const selector = 'rel=stylesheet';
      expect(linkService.getLink(selector)).toBeNull();

      linkService.addLink({rel: 'stylesheet', href: 'http://foo.bar'});

      expect(linkService.getLink(selector)).not.toBeNull();

      linkService.removeLink(selector);

      expect(linkService.getLink(selector)).toBeNull();
    });

    it('should remove link tag by the given element', () => {
      const selector = 'rel=stylesheet';
      expect(linkService.getLink(selector)).toBeNull();

      linkService.addLinks([{rel: 'stylesheet', href: 'http://foo.bar'}]);

      const link = linkService.getLink(selector) !;
      expect(link).not.toBeNull();

      linkService.removeLinkElement(link);

      expect(linkService.getLink(selector)).toBeNull();
    });

    it('should update link tag matching the given selector', () => {
      const selector = 'rel="stylesheet"';
      linkService.updateLink({rel: 'stylesheet'}, selector);

      const actual = linkService.getLink(selector);
      expect(actual).not.toBeNull();
      expect(actual !.getAttribute('rel')).toEqual('stylesheet');
    });

    it('should extract selector from the tag definition', () => {
      const selector = 'rel="stylesheet"';
      linkService.updateLink({property: 'stylesheet', href: 'http://foo.bar'});

      const actual = linkService.getLink(selector);
      expect(actual).not.toBeNull();
      expect(actual !.getAttribute('href')).toEqual('http://foo.bar');
    });

    it('should create link tag if it does not exist', () => {
      const selector = 'rel="stylesheet"';

      linkService.updateLink({rel: 'stylesheet', href: 'http://foo.bar'}, selector);

      const actual = linkService.getLink(selector) !;
      expect(actual).not.toBeNull();
      expect(actual.getAttribute('href')).toEqual('http://foo.bar');

      // clean up
      linkService.removeLinkElement(actual);
    });

    it('should add new link tag', () => {
      const selector = 'rel="stylesheet"';
      expect(linkService.getLink(selector)).toBeNull();

      linkService.addLink({rel: 'stylesheet', href: 'http://foo.bar'});

      const actual = linkService.getLink(selector) !;
      expect(actual).not.toBeNull();
      expect(actual.getAttribute('href')).toEqual('http://foo.bar');

      // clean up
      linkService.removeLinkElement(actual);
    });

    it('should add multiple new link tags', () => {
      const nameSelector = 'rel="canonical"';
      const propertySelector = 'rel="author"';
      expect(linkService.getLink(nameSelector)).toBeNull();
      expect(linkService.getLink(propertySelector)).toBeNull();

      linkService.addLinks(
          [{rel: 'canonical', href: 'http://foo.bar'}, {rel: 'author', href: 'http://bar.baz'}]);
      const canonicalLink = linkService.getLink(nameSelector) !;
      const authorLink = linkService.getLink(propertySelector) !;
      expect(canonicalLink).not.toBeNull();
      expect(authorLink).not.toBeNull();

      // clean up
      linkService.removeLinkElement(canonicalLink);
      linkService.removeLinkElement(authorLink);
    });

    it('should not add meta tag if it is already present on the page and has the same attr', () => {
      const selector = 'rel="canonical"';
      expect(linkService.getLinks(selector).length).toEqual(1);

      linkService.addLink({rel: 'canonical', href: 'http://example.com'});

      expect(linkService.getLinks(selector).length).toEqual(1);
    });

    it('should add meta tag if it is already present on the page and but has different attr',
       () => {
         const selector = 'rel="canonical"';
         expect(linkService.getLinks(selector).length).toEqual(1);

         const meta = linkService.addLink({rel: 'canonical', href: 'http://bar.baz'}) !;

         expect(linkService.getLinks(selector).length).toEqual(2);

         // clean up
         linkService.removeLinkElement(meta);
       });

    it('should add meta tag if it is already present on the page and force true', () => {
      const selector = 'rel="canonical"';
      expect(linkService.getLinks(selector).length).toEqual(1);

      const meta = linkService.addLink({rel: 'canonical', href: 'http://bar.baz'}, true) !;

      expect(linkService.getLinks(selector).length).toEqual(2);

      // clean up
      linkService.removeLinkElement(meta);
    });
  });

  describe('integration test', () => {
    @Injectable()
    class DependsOnLink {
      constructor(public link: Link) {}
    }

    beforeEach(() => {
      TestBed.configureTestingModule({imports: [BrowserModule], providers: [DependsOnLink]});
    });

    it('should inject Link service when using BrowserModule',
       () => expect(TestBed.inject(DependsOnLink).link).toBeAnInstanceOf(Link));
  });
}
