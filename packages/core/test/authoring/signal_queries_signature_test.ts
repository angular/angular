/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  contentChild,
  contentChildren,
  ElementRef,
  forwardRef,
  InjectionToken,
  Signal,
  viewChild,
  viewChildren,
} from '../../src/core';

class QueryType {
  // a random field to brand the type
  query = true;
}

class ReadType {
  // a random field to brand the type
  read = true;
}

const QUERY_TYPE_TOKEN = new InjectionToken<QueryType>('QueryTypeToken');

// A const to reference the Signal type import
const _import: Signal<unknown> | undefined = undefined;

export class SignalQuerySignatureTest {
  // optional view child

  /** unknown */
  viewChildStringLocatorNoRead = viewChild('ref');

  /** ElementRef<HTMLAnchorElement> | undefined */
  viewChildStringLocatorNoReadElementRefTypeHint = viewChild<ElementRef<HTMLAnchorElement>>('ref');

  // any due to https://github.com/angular/angular/issues/53894
  /** ElementRef<any> | undefined */
  viewChildStringLocatorWithElementRefRead = viewChild('ref', {
    read: ElementRef<HTMLAnchorElement>,
  });

  /** ReadType | undefined */
  viewChildStringLocatorWithRead = viewChild('ref', {read: ReadType});

  /** QueryType | undefined */
  viewChildTypeLocatorNoRead = viewChild(QueryType);

  /** any */
  viewChildTypeLocatorForwardRefNoRead = viewChild(forwardRef(() => QueryType));

  /** QueryType | undefined */
  viewChildInjectionTokenLocatorNoRead = viewChild(QUERY_TYPE_TOKEN);

  /** ReadType | undefined */
  viewChildTypeLocatorAndRead = viewChild(QueryType, {read: ReadType});

  // any due to https://github.com/angular/angular/issues/53894
  /** ElementRef<any> | undefined */
  viewChildTypeLocatorAndElementRefRead = viewChild(QueryType, {
    read: ElementRef<HTMLAnchorElement>,
  });

  // required view child

  /** ElementRef<HTMLAnchorElement> */
  viewChildStringLocatorNoReadElementRefTypeHintReq =
    viewChild.required<ElementRef<HTMLAnchorElement>>('ref');

  // any due to https://github.com/angular/angular/issues/53894
  /** ElementRef<any> */
  viewChildStringLocatorWithElementRefReadReq = viewChild.required('ref', {
    read: ElementRef<HTMLAnchorElement>,
  });

  /** ReadType */
  viewChildStringLocatorWithReadReq = viewChild.required('ref', {read: ReadType});

  /** QueryType */
  viewChildTypeLocatorNoReadReq = viewChild.required(QueryType);

  /** ReadType */
  viewChildTypeLocatorAndReadReq = viewChild.required(QueryType, {read: ReadType});

  // any due to https://github.com/angular/angular/issues/53894
  /** ElementRef<any> */
  viewChildTypeLocatorAndElementRefReadReq = viewChild.required(QueryType, {
    read: ElementRef<HTMLAnchorElement>,
  });

  // view children

  /** readonly unknown[] */
  viewChildrenStringLocatorNoRead = viewChildren('ref');

  /** readonly ElementRef<HTMLAnchorElement>[] */
  viewChildrenStringLocatorNoReadElementRefTypeHint =
    viewChildren<ElementRef<HTMLAnchorElement>>('ref');

  /** readonly ReadType[] */
  viewChildrenStringLocatorWithTypeRead = viewChildren('ref', {read: ReadType});

  // any due to https://github.com/angular/angular/issues/53894
  /** readonly ElementRef<any>[] */
  viewChildrenStringLocatorWithElementRefRead = viewChildren('ref', {
    read: ElementRef<HTMLAnchorElement>,
  });

  /** readonly QueryType[]*/
  viewChildrenTypeLocatorNoRead = viewChildren(QueryType);

  /** readonly any[] */
  viewChildrenTypeLocatorForwardRefNoRead = viewChildren(forwardRef(() => QueryType));

  /** readonly QueryType[] */
  viewChildrenInjectionTokenLocatorNoRead = viewChildren(QUERY_TYPE_TOKEN);

  /** readonly ReadType[] */
  viewChildrenTypeLocatorAndRead = viewChildren(QueryType, {read: ReadType});

  // any due to https://github.com/angular/angular/issues/53894
  /** readonly ElementRef<any>[] */
  viewChildrenTypeLocatorAndElementRefRead = viewChildren(QueryType, {
    read: ElementRef<HTMLAnchorElement>,
  });

  // optional content child

  /** unknown */
  contentChildStringLocatorNoRead = contentChild('ref');

  /** ElementRef<HTMLAnchorElement> | undefined */
  contentChildStringLocatorNoReadElementRefTypeHint =
    contentChild<ElementRef<HTMLAnchorElement>>('ref');

  // any due to https://github.com/angular/angular/issues/53894
  /** ElementRef<any> | undefined */
  contentChildStringLocatorWithElementRefRead = contentChild('ref', {
    read: ElementRef<HTMLAnchorElement>,
  });

  /** ReadType | undefined */
  contentChildStringLocatorWithRead = contentChild('ref', {read: ReadType});

  /** QueryType | undefined */
  contentChildTypeLocatorNoRead = contentChild(QueryType);

  /** any */
  contentChildTypeLocatorForwardRefNoRead = contentChild(forwardRef(() => QueryType));

  /** QueryType | undefined */
  contentChildInjectionTokenLocatorNoRead = contentChild(QUERY_TYPE_TOKEN);

  /** ReadType | undefined */
  contentChildTypeLocatorAndRead = contentChild(QueryType, {read: ReadType});

  // any due to https://github.com/angular/angular/issues/53894
  /** ElementRef<any> | undefined */
  contentChildTypeLocatorAndElementRefRead = contentChild(QueryType, {
    read: ElementRef<HTMLAnchorElement>,
  });

  // required content child

  /** ElementRef<HTMLAnchorElement> */
  contentChildStringLocatorNoReadElementRefTypeHintReq =
    contentChild.required<ElementRef<HTMLAnchorElement>>('ref');

  // any due to https://github.com/angular/angular/issues/53894
  /** ElementRef<any> */
  contentChildStringLocatorWithElementRefReadReq = contentChild.required('ref', {
    read: ElementRef<HTMLAnchorElement>,
  });

  /** ReadType */
  contentChildStringLocatorWithReadReq = contentChild.required('ref', {read: ReadType});

  /** QueryType */
  contentChildTypeLocatorNoReadReq = contentChild.required(QueryType);

  /** ReadType */
  contentChildTypeLocatorAndReadReq = contentChild.required(QueryType, {read: ReadType});

  // any due to https://github.com/angular/angular/issues/53894
  /** ElementRef<any> */
  contentChildTypeLocatorAndElementRefReadReq = contentChild.required(QueryType, {
    read: ElementRef<HTMLAnchorElement>,
  });

  // view children

  /** readonly unknown[] */
  contentChildrenStringLocatorNoRead = contentChildren('ref');

  /** readonly ElementRef<HTMLAnchorElement>[] */
  contentChildrenStringLocatorNoReadElementRefTypeHint =
    contentChildren<ElementRef<HTMLAnchorElement>>('ref');

  /** readonly ReadType[] */
  contentChildrenStringLocatorWithTypeRead = contentChildren('ref', {read: ReadType});

  // any due to https://github.com/angular/angular/issues/53894
  /** readonly ElementRef<any>[] */
  contentChildrenStringLocatorWithElementRefRead = contentChildren('ref', {
    read: ElementRef<HTMLAnchorElement>,
  });

  /** readonly QueryType[]*/
  contentChildrenTypeLocatorNoRead = contentChildren(QueryType);

  /** readonly any[] */
  contentChildrenTypeLocatorForwardRefNoRead = contentChildren(forwardRef(() => QueryType));

  /** readonly QueryType[] */
  contentChildrenInjectionTokenLocatorNoRead = contentChildren(QUERY_TYPE_TOKEN);

  /** readonly ReadType[] */
  contentChildrenTypeLocatorAndRead = contentChildren(QueryType, {read: ReadType});

  // any due to https://github.com/angular/angular/issues/53894
  /** readonly ElementRef<any>[] */
  contentChildrenTypeLocatorAndElementRefRead = contentChildren(QueryType, {
    read: ElementRef<HTMLAnchorElement>,
  });
}
