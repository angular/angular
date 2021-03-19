/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {core as compilerCore} from '@angular/compiler';
import * as core from '@angular/core';

{
  describe('compiler core', () => {
    it('Attribute should be equal', () => {
      typeExtends<compilerCore.Attribute, core.Attribute>();
      typeExtends<core.Attribute, compilerCore.Attribute>();
      compareRuntimeShape(new core.Attribute('someName'), compilerCore.createAttribute('someName'));
    });

    it('Inject should be equal', () => {
      typeExtends<compilerCore.Inject, core.Inject>();
      typeExtends<core.Inject, compilerCore.Inject>();
      compareRuntimeShape(new core.Inject('someName'), compilerCore.createInject('someName'));
    });

    it('Query should be equal', () => {
      typeExtends<compilerCore.Query, core.Query>();
      typeExtends<core.Query, compilerCore.Query>();
      compareRuntimeShape(
          new core.ContentChild('someSelector'), compilerCore.createContentChild('someSelector'));
      compareRuntimeShape(
          new core.ContentChild('someSelector', {read: 'someRead'}),
          compilerCore.createContentChild('someSelector', {read: 'someRead'}));
      compareRuntimeShape(
          new core.ContentChildren('someSelector'),
          compilerCore.createContentChildren('someSelector'));
      compareRuntimeShape(
          new core.ContentChildren('someSelector', {read: 'someRead', descendants: false}),
          compilerCore.createContentChildren(
              'someSelector', {read: 'someRead', descendants: false}));
      compareRuntimeShape(
          new core.ViewChild('someSelector'), compilerCore.createViewChild('someSelector'));
      compareRuntimeShape(
          new core.ViewChild('someSelector', {read: 'someRead'}),
          compilerCore.createViewChild('someSelector', {read: 'someRead'}));
      compareRuntimeShape(
          new core.ViewChildren('someSelector'), compilerCore.createViewChildren('someSelector'));
      compareRuntimeShape(
          new core.ViewChildren('someSelector', {read: 'someRead'}),
          compilerCore.createViewChildren('someSelector', {read: 'someRead'}));
    });

    it('Directive should be equal', () => {
      typeExtends<compilerCore.Directive, core.Directive>();
      typeExtends<core.Directive, compilerCore.Directive>();
      compareRuntimeShape(new core.Directive({}), compilerCore.createDirective({}));
    });

    it('Component should be equal', () => {
      typeExtends<compilerCore.Component, core.Component>();
      typeExtends<core.Component, compilerCore.Component>();
      compareRuntimeShape(new core.Component({}), compilerCore.createComponent({}));
    });

    it('Pipe should be equal', () => {
      typeExtends<compilerCore.Pipe, core.Pipe>();
      typeExtends<core.Pipe, compilerCore.Pipe>();
      compareRuntimeShape(
          new core.Pipe({name: 'someName'}), compilerCore.createPipe({name: 'someName'}));
    });

    it('NgModule should be equal', () => {
      typeExtends<compilerCore.NgModule, core.NgModule>();
      typeExtends<core.NgModule, compilerCore.NgModule>();
      compareRuntimeShape(new core.NgModule({}), compilerCore.createNgModule({}));
    });

    it('marker metadata should be equal', () => {
      compareRuntimeShape(new core.Injectable(), compilerCore.createInjectable());
      compareRuntimeShape(new core.Optional(), compilerCore.createOptional());
      compareRuntimeShape(new core.Self(), compilerCore.createSelf());
      compareRuntimeShape(new core.SkipSelf(), compilerCore.createSkipSelf());
      compareRuntimeShape(new core.Host(), compilerCore.createHost());
    });

    it('InjectionToken should be equal', () => {
      compareRuntimeShape(
          new core.InjectionToken('someName'), compilerCore.createInjectionToken('someName'));
    });

    it('non const enums should be equal', () => {
      typeExtends<compilerCore.ViewEncapsulation, core.ViewEncapsulation>();
      typeExtends<core.ViewEncapsulation, compilerCore.ViewEncapsulation>();

      typeExtends<compilerCore.ChangeDetectionStrategy, core.ChangeDetectionStrategy>();
      typeExtends<core.ChangeDetectionStrategy, compilerCore.ChangeDetectionStrategy>();

      typeExtends<compilerCore.SecurityContext, core.SecurityContext>();
      typeExtends<core.SecurityContext, compilerCore.SecurityContext>();

      typeExtends<compilerCore.MissingTranslationStrategy, core.MissingTranslationStrategy>();
      typeExtends<core.MissingTranslationStrategy, compilerCore.MissingTranslationStrategy>();
    });

    it('const enums should be equal', () => {
      const expectToBe = (val1: any, val2: any) => expect(val1).toBe(val2);

      expectToBe(compilerCore.NodeFlags.None, core.ɵNodeFlags.None);
      expectToBe(compilerCore.NodeFlags.TypeElement, core.ɵNodeFlags.TypeElement);
      expectToBe(compilerCore.NodeFlags.TypeText, core.ɵNodeFlags.TypeText);
      expectToBe(compilerCore.NodeFlags.ProjectedTemplate, core.ɵNodeFlags.ProjectedTemplate);
      expectToBe(compilerCore.NodeFlags.CatRenderNode, core.ɵNodeFlags.CatRenderNode);
      expectToBe(compilerCore.NodeFlags.TypeNgContent, core.ɵNodeFlags.TypeNgContent);
      expectToBe(compilerCore.NodeFlags.TypePipe, core.ɵNodeFlags.TypePipe);
      expectToBe(compilerCore.NodeFlags.TypePureArray, core.ɵNodeFlags.TypePureArray);
      expectToBe(compilerCore.NodeFlags.TypePureObject, core.ɵNodeFlags.TypePureObject);
      expectToBe(compilerCore.NodeFlags.TypePurePipe, core.ɵNodeFlags.TypePurePipe);
      expectToBe(compilerCore.NodeFlags.CatPureExpression, core.ɵNodeFlags.CatPureExpression);
      expectToBe(compilerCore.NodeFlags.TypeValueProvider, core.ɵNodeFlags.TypeValueProvider);
      expectToBe(compilerCore.NodeFlags.TypeClassProvider, core.ɵNodeFlags.TypeClassProvider);
      expectToBe(compilerCore.NodeFlags.TypeFactoryProvider, core.ɵNodeFlags.TypeFactoryProvider);
      expectToBe(
          compilerCore.NodeFlags.TypeUseExistingProvider, core.ɵNodeFlags.TypeUseExistingProvider);
      expectToBe(compilerCore.NodeFlags.LazyProvider, core.ɵNodeFlags.LazyProvider);
      expectToBe(compilerCore.NodeFlags.PrivateProvider, core.ɵNodeFlags.PrivateProvider);
      expectToBe(compilerCore.NodeFlags.TypeDirective, core.ɵNodeFlags.TypeDirective);
      expectToBe(compilerCore.NodeFlags.Component, core.ɵNodeFlags.Component);
      expectToBe(
          compilerCore.NodeFlags.CatProviderNoDirective, core.ɵNodeFlags.CatProviderNoDirective);
      expectToBe(compilerCore.NodeFlags.CatProvider, core.ɵNodeFlags.CatProvider);
      expectToBe(compilerCore.NodeFlags.OnInit, core.ɵNodeFlags.OnInit);
      expectToBe(compilerCore.NodeFlags.OnDestroy, core.ɵNodeFlags.OnDestroy);
      expectToBe(compilerCore.NodeFlags.DoCheck, core.ɵNodeFlags.DoCheck);
      expectToBe(compilerCore.NodeFlags.OnChanges, core.ɵNodeFlags.OnChanges);
      expectToBe(compilerCore.NodeFlags.AfterContentInit, core.ɵNodeFlags.AfterContentInit);
      expectToBe(compilerCore.NodeFlags.AfterContentChecked, core.ɵNodeFlags.AfterContentChecked);
      expectToBe(compilerCore.NodeFlags.AfterViewInit, core.ɵNodeFlags.AfterViewInit);
      expectToBe(compilerCore.NodeFlags.AfterViewChecked, core.ɵNodeFlags.AfterViewChecked);
      expectToBe(compilerCore.NodeFlags.EmbeddedViews, core.ɵNodeFlags.EmbeddedViews);
      expectToBe(compilerCore.NodeFlags.ComponentView, core.ɵNodeFlags.ComponentView);
      expectToBe(compilerCore.NodeFlags.TypeContentQuery, core.ɵNodeFlags.TypeContentQuery);
      expectToBe(compilerCore.NodeFlags.TypeViewQuery, core.ɵNodeFlags.TypeViewQuery);
      expectToBe(compilerCore.NodeFlags.StaticQuery, core.ɵNodeFlags.StaticQuery);
      expectToBe(compilerCore.NodeFlags.DynamicQuery, core.ɵNodeFlags.DynamicQuery);
      expectToBe(compilerCore.NodeFlags.CatQuery, core.ɵNodeFlags.CatQuery);
      expectToBe(compilerCore.NodeFlags.Types, core.ɵNodeFlags.Types);

      expectToBe(compilerCore.DepFlags.None, core.ɵDepFlags.None);
      expectToBe(compilerCore.DepFlags.SkipSelf, core.ɵDepFlags.SkipSelf);
      expectToBe(compilerCore.DepFlags.Optional, core.ɵDepFlags.Optional);
      expectToBe(compilerCore.DepFlags.Value, core.ɵDepFlags.Value);

      expectToBe(compilerCore.InjectFlags.Default, core.InjectFlags.Default);
      expectToBe(compilerCore.InjectFlags.SkipSelf, core.InjectFlags.SkipSelf);
      expectToBe(compilerCore.InjectFlags.Self, core.InjectFlags.Self);
      expectToBe(compilerCore.InjectFlags.Host, core.InjectFlags.Host);
      expectToBe(compilerCore.InjectFlags.Optional, core.InjectFlags.Optional);

      expectToBe(compilerCore.ArgumentType.Inline, core.ɵArgumentType.Inline);
      expectToBe(compilerCore.ArgumentType.Dynamic, core.ɵArgumentType.Dynamic);

      expectToBe(
          compilerCore.BindingFlags.TypeElementAttribute, core.ɵBindingFlags.TypeElementAttribute);
      expectToBe(compilerCore.BindingFlags.TypeElementClass, core.ɵBindingFlags.TypeElementClass);
      expectToBe(compilerCore.BindingFlags.TypeElementStyle, core.ɵBindingFlags.TypeElementStyle);
      expectToBe(compilerCore.BindingFlags.TypeProperty, core.ɵBindingFlags.TypeProperty);
      expectToBe(compilerCore.BindingFlags.SyntheticProperty, core.ɵBindingFlags.SyntheticProperty);
      expectToBe(
          compilerCore.BindingFlags.SyntheticHostProperty,
          core.ɵBindingFlags.SyntheticHostProperty);
      expectToBe(
          compilerCore.BindingFlags.CatSyntheticProperty, core.ɵBindingFlags.CatSyntheticProperty);
      expectToBe(compilerCore.BindingFlags.Types, core.ɵBindingFlags.Types);

      expectToBe(compilerCore.QueryBindingType.First, core.ɵQueryBindingType.First);
      expectToBe(compilerCore.QueryBindingType.All, core.ɵQueryBindingType.All);

      expectToBe(compilerCore.QueryValueType.ElementRef, core.ɵQueryValueType.ElementRef);
      expectToBe(compilerCore.QueryValueType.RenderElement, core.ɵQueryValueType.RenderElement);
      expectToBe(compilerCore.QueryValueType.TemplateRef, core.ɵQueryValueType.TemplateRef);
      expectToBe(
          compilerCore.QueryValueType.ViewContainerRef, core.ɵQueryValueType.ViewContainerRef);
      expectToBe(compilerCore.QueryValueType.Provider, core.ɵQueryValueType.Provider);

      expectToBe(compilerCore.ViewFlags.None, core.ɵViewFlags.None);
      expectToBe(compilerCore.ViewFlags.OnPush, core.ɵViewFlags.OnPush);
    });
  });
}

function compareRuntimeShape(a: any, b: any) {
  const keys = metadataKeys(a);
  expect(keys).toEqual(metadataKeys(b));
  keys.forEach(key => {
    expect(a[key]).toBe(b[key]);
  });
  // Need to check 'ngMetadataName' separately, as this is
  // on the prototype in @angular/core, but a regular property in @angular/compiler.
  expect(a.ngMetadataName).toBe(b.ngMetadataName);
}

function metadataKeys(a: any): string[] {
  return Object.keys(a).filter(prop => prop !== 'ngMetadataName' && !prop.startsWith('_')).sort();
}

function typeExtends<T1 extends T2, T2>() {}
