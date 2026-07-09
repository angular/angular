/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {DOCUMENT, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {BrowserModule, Meta} from '../../index';

describe('Meta service', () => {
  let doc: Document;
  let metaService: Meta;
  let defaultMeta: HTMLMetaElement;

  beforeEach(() => {
    doc = getDOM().createHtmlDocument();
    TestBed.configureTestingModule({providers: [{provide: DOCUMENT, useValue: doc}]});
    metaService = TestBed.inject(Meta);
    defaultMeta = getDOM().createElement('meta', doc) as HTMLMetaElement;
    defaultMeta.setAttribute('property', 'fb:app_id');
    defaultMeta.setAttribute('content', '123456789');
    doc.getElementsByTagName('head')[0].appendChild(defaultMeta);
  });

  afterEach(() => getDOM().remove(defaultMeta));

  it('should return meta tag matching selector', () => {
    const actual: HTMLMetaElement = metaService.getTag('property="fb:app_id"')!;
    expect(actual).not.toBeNull();
    expect(actual.getAttribute('content')).toEqual('123456789');
  });

  it('should return all meta tags matching selector', () => {
    const tag1 = metaService.addTag({name: 'author', content: 'page author'})!;
    const tag2 = metaService.addTag({name: 'author', content: 'another page author'})!;

    const actual: HTMLMetaElement[] = metaService.getTags('name=author');
    expect(actual.length).toEqual(2);
    expect(actual[0].getAttribute('content')).toEqual('page author');
    expect(actual[1].getAttribute('content')).toEqual('another page author');

    // clean up
    metaService.removeTagElement(tag1);
    metaService.removeTagElement(tag2);
  });

  it('should return null if meta tag does not exist', () => {
    const actual: HTMLMetaElement = metaService.getTag('fake=fake')!;
    expect(actual).toBeNull();
  });

  it('should remove meta tag by the given selector', () => {
    const selector = 'name=author';
    expect(metaService.getTag(selector)).toBeNull();

    metaService.addTag({name: 'author', content: 'page author'});

    expect(metaService.getTag(selector)).not.toBeNull();

    metaService.removeTag(selector);

    expect(metaService.getTag(selector)).toBeNull();
  });

  it('should remove meta tag by the given element', () => {
    const selector = 'name=keywords';
    expect(metaService.getTag(selector)).toBeNull();

    metaService.addTags([{name: 'keywords', content: 'meta test'}]);

    const meta = metaService.getTag(selector)!;
    expect(meta).not.toBeNull();

    metaService.removeTagElement(meta);

    expect(metaService.getTag(selector)).toBeNull();
  });

  it('should update meta tag matching the given selector', () => {
    const selector = 'property="fb:app_id"';
    metaService.updateTag({content: '4321'}, selector);

    const actual = metaService.getTag(selector);
    expect(actual).not.toBeNull();
    expect(actual!.getAttribute('content')).toEqual('4321');
  });

  it('should not allow a custom selector to match off target elements like the body tag', () => {
    // This payload attempts to break out of the `meta[name="..."]` constraint entirely
    // and inject a comma to target arbitrary DOM elements like the `body` tag via the
    // `selector` argument of `updateTag`.
    const attackerSelector = 'name="description"], body, meta[name="pwned"';

    const firstMeta = metaService.updateTag({content: 'pwned'}, attackerSelector)!;

    expect(firstMeta).not.toBeNull();
    // It creates a new meta element instead of targeting `body` because it did not
    // find a meta element matching the dirty selector since `body` is not a `meta` tag
    expect(firstMeta!.nodeName.toLowerCase()).toEqual('meta');
    expect(firstMeta!.getAttribute('content')).toEqual('pwned');
    expect(doc.body.getAttribute('content')).toBeNull();

    metaService.removeTagElement(firstMeta);
  });

  it('should extract selector from the tag definition', () => {
    const selector = 'property="fb:app_id"';
    metaService.updateTag({property: 'fb:app_id', content: '666'});

    const actual = metaService.getTag(selector);
    expect(actual).not.toBeNull();
    expect(actual!.getAttribute('content')).toEqual('666');
  });

  it('should create meta tag if it does not exist', () => {
    const selector = 'name="twitter:title"';

    metaService.updateTag({name: 'twitter:title', content: 'Content Title'}, selector);

    const actual = metaService.getTag(selector)!;
    expect(actual).not.toBeNull();
    expect(actual.getAttribute('content')).toEqual('Content Title');

    // clean up
    metaService.removeTagElement(actual);
  });

  it('should add new meta tag', () => {
    const selector = 'name="og:title"';
    expect(metaService.getTag(selector)).toBeNull();

    metaService.addTag({name: 'og:title', content: 'Content Title'});

    const actual = metaService.getTag(selector)!;
    expect(actual).not.toBeNull();
    expect(actual.getAttribute('content')).toEqual('Content Title');

    // clean up
    metaService.removeTagElement(actual);
  });

  it('should add httpEquiv meta tag as http-equiv', () => {
    metaService.addTag({httpEquiv: 'refresh', content: '3;url=http://test'});

    const actual = metaService.getTag('http-equiv')!;
    expect(actual).not.toBeNull();
    expect(actual.getAttribute('http-equiv')).toEqual('refresh');
    expect(actual.getAttribute('content')).toEqual('3;url=http://test');

    // clean up
    metaService.removeTagElement(actual);
  });

  it('should escape selector values when deriving the match selector', () => {
    // This payload attempts to prematurely close the attribute selector
    // and match another attribute.
    const property = 'fb:app_id"][content="123456789';

    const meta = metaService.updateTag({property, content: 'pwned'})!;

    expect(meta).not.toBe(defaultMeta);
    expect(meta.getAttribute('property')).toEqual(property);
    expect(meta.getAttribute('content')).toEqual('pwned');
    expect(metaService.getTags('property="fb:app_id"').length).toEqual(1);

    // clean up
    metaService.removeTagElement(meta);
  });

  it('should not let a quoted name break out of the meta selector and target body', () => {
    // This payload attempts to break out of the `meta[name="..."]` constraint entirely
    // and inject a comma to target arbitrary DOM elements like the `body` tag.
    const attackerName = 'description"], body';

    const firstMeta = metaService.addTag({name: attackerName, content: 'safe'})!;
    const secondMeta = metaService.addTag({name: attackerName, content: 'safe'})!;

    expect(firstMeta).toBe(secondMeta);
    expect(firstMeta.tagName).toEqual('META');
    expect(
      Array.from(doc.getElementsByTagName('meta')).filter(
        (meta) => meta.getAttribute('name') === attackerName,
      ).length,
    ).toEqual(1);
    expect(doc.body).not.toBeNull();

    // clean up
    metaService.removeTagElement(firstMeta);
  });

  it('should add multiple new meta tags', () => {
    const nameSelector = 'name="twitter:title"';
    const propertySelector = 'property="og:title"';
    expect(metaService.getTag(nameSelector)).toBeNull();
    expect(metaService.getTag(propertySelector)).toBeNull();

    metaService.addTags([
      {name: 'twitter:title', content: 'Content Title'},
      {property: 'og:title', content: 'Content Title'},
    ]);
    const twitterMeta = metaService.getTag(nameSelector)!;
    const fbMeta = metaService.getTag(propertySelector)!;
    expect(twitterMeta).not.toBeNull();
    expect(fbMeta).not.toBeNull();

    // clean up
    metaService.removeTagElement(twitterMeta);
    metaService.removeTagElement(fbMeta);
  });

  it('should not add meta tag if it is already present on the page and has the same attr', () => {
    const selector = 'property="fb:app_id"';
    expect(metaService.getTags(selector).length).toEqual(1);

    metaService.addTag({property: 'fb:app_id', content: '123456789'});

    expect(metaService.getTags(selector).length).toEqual(1);
  });

  it('should not add meta tag if it is already present on the page, even if the first tag with the same name has different other attributes', () => {
    metaService.addTag({name: 'description', content: 'aaa'});
    metaService.addTag({name: 'description', content: 'bbb'});
    metaService.addTag({name: 'description', content: 'aaa'});
    metaService.addTag({name: 'description', content: 'bbb'});

    expect(metaService.getTags('name="description"').length).toEqual(2);
  });

  it('should add meta tag if it is already present on the page and but has different attr', () => {
    const selector = 'property="fb:app_id"';
    expect(metaService.getTags(selector).length).toEqual(1);

    const meta = metaService.addTag({property: 'fb:app_id', content: '666'})!;

    expect(metaService.getTags(selector).length).toEqual(2);

    // clean up
    metaService.removeTagElement(meta);
  });

  it('should add meta tag if it is already present on the page and force true', () => {
    const selector = 'property="fb:app_id"';
    expect(metaService.getTags(selector).length).toEqual(1);

    const meta = metaService.addTag({property: 'fb:app_id', content: '123456789'}, true)!;

    expect(metaService.getTags(selector).length).toEqual(2);

    // clean up
    metaService.removeTagElement(meta);
  });

  describe('integration test', () => {
    @Injectable()
    class DependsOnMeta {
      constructor(public meta: Meta) {}
    }

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [BrowserModule],
        providers: [DependsOnMeta],
      });
    });

    it('should inject Meta service when using BrowserModule', () =>
      expect(TestBed.inject(DependsOnMeta).meta).toBeInstanceOf(Meta));
  });
});
