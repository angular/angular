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
import {BrowserModule, Title} from '../../index';
import {expect} from '@angular/private/testing/matchers';

describe('title service', () => {
  let doc: Document;
  let initialTitle: string;
  let titleService: Title;

  beforeEach(() => {
    doc = getDOM().createHtmlDocument();
    initialTitle = doc.title;
    titleService = new Title(doc);
  });

  afterEach(() => {
    doc.title = initialTitle;
  });

  it('should allow reading initial title', () => {
    expect(titleService.getTitle()).toEqual(initialTitle);
  });

  it('should set a title on the injected document', () => {
    titleService.setTitle('test title');
    expect(doc.title).toEqual('test title');
    expect(titleService.getTitle()).toEqual('test title');
  });

  it('should reset title to empty string if title not provided', () => {
    titleService.setTitle(null!);
    expect(doc.title).toEqual('');
  });
});

describe('integration test', () => {
  @Injectable()
  class DependsOnTitle {
    constructor(public title: Title) {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule],
      providers: [DependsOnTitle],
    });
  });

  it('should inject Title service when using BrowserModule', () => {
    expect(TestBed.inject(DependsOnTitle).title).toBeInstanceOf(Title);
  });
});
