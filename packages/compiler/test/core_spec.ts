/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {core as compilerCore} from '@angular/compiler';
import * as core from '@angular/core';

export function main() {
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
      expect(compilerCore.NodeFlags.None).toBe(core.ɵNodeFlags.None);
      expect(compilerCore.NodeFlags.TypeElement).toBe(core.ɵNodeFlags.TypeElement);
      expect(compilerCore.NodeFlags.TypeText).toBe(core.ɵNodeFlags.TypeText);
      expect(compilerCore.NodeFlags.ProjectedTemplate).toBe(core.ɵNodeFlags.ProjectedTemplate);
      expect(compilerCore.NodeFlags.CatRenderNode).toBe(core.ɵNodeFlags.CatRenderNode);
      expect(compilerCore.NodeFlags.TypeNgContent).toBe(core.ɵNodeFlags.TypeNgContent);
      expect(compilerCore.NodeFlags.TypePipe).toBe(core.ɵNodeFlags.TypePipe);
      expect(compilerCore.NodeFlags.TypePureArray).toBe(core.ɵNodeFlags.TypePureArray);
      expect(compilerCore.NodeFlags.TypePureObject).toBe(core.ɵNodeFlags.TypePureObject);
      expect(compilerCore.NodeFlags.TypePurePipe).toBe(core.ɵNodeFlags.TypePurePipe);
      expect(compilerCore.NodeFlags.CatPureExpression).toBe(core.ɵNodeFlags.CatPureExpression);
      expect(compilerCore.NodeFlags.TypeValueProvider).toBe(core.ɵNodeFlags.TypeValueProvider);
      expect(compilerCore.NodeFlags.TypeClassProvider).toBe(core.ɵNodeFlags.TypeClassProvider);
      expect(compilerCore.NodeFlags.TypeFactoryProvider).toBe(core.ɵNodeFlags.TypeFactoryProvider);
      expect(compilerCore.NodeFlags.TypeUseExistingProvider)
          .toBe(core.ɵNodeFlags.TypeUseExistingProvider);
      expect(compilerCore.NodeFlags.LazyProvider).toBe(core.ɵNodeFlags.LazyProvider);
      expect(compilerCore.NodeFlags.PrivateProvider).toBe(core.ɵNodeFlags.PrivateProvider);
      expect(compilerCore.NodeFlags.TypeDirective).toBe(core.ɵNodeFlags.TypeDirective);
      expect(compilerCore.NodeFlags.Component).toBe(core.ɵNodeFlags.Component);
      expect(compilerCore.NodeFlags.CatProviderNoDirective)
          .toBe(core.ɵNodeFlags.CatProviderNoDirective);
      expect(compilerCore.NodeFlags.CatProvider).toBe(core.ɵNodeFlags.CatProvider);
      expect(compilerCore.NodeFlags.OnInit).toBe(core.ɵNodeFlags.OnInit);
      expect(compilerCore.NodeFlags.OnDestroy).toBe(core.ɵNodeFlags.OnDestroy);
      expect(compilerCore.NodeFlags.DoCheck).toBe(core.ɵNodeFlags.DoCheck);
      expect(compilerCore.NodeFlags.OnChanges).toBe(core.ɵNodeFlags.OnChanges);
      expect(compilerCore.NodeFlags.AfterContentInit).toBe(core.ɵNodeFlags.AfterContentInit);
      expect(compilerCore.NodeFlags.AfterContentChecked).toBe(core.ɵNodeFlags.AfterContentChecked);
      expect(compilerCore.NodeFlags.AfterViewInit).toBe(core.ɵNodeFlags.AfterViewInit);
      expect(compilerCore.NodeFlags.AfterViewChecked).toBe(core.ɵNodeFlags.AfterViewChecked);
      expect(compilerCore.NodeFlags.EmbeddedViews).toBe(core.ɵNodeFlags.EmbeddedViews);
      expect(compilerCore.NodeFlags.ComponentView).toBe(core.ɵNodeFlags.ComponentView);
      expect(compilerCore.NodeFlags.TypeContentQuery).toBe(core.ɵNodeFlags.TypeContentQuery);
      expect(compilerCore.NodeFlags.TypeViewQuery).toBe(core.ɵNodeFlags.TypeViewQuery);
      expect(compilerCore.NodeFlags.StaticQuery).toBe(core.ɵNodeFlags.StaticQuery);
      expect(compilerCore.NodeFlags.DynamicQuery).toBe(core.ɵNodeFlags.DynamicQuery);
      expect(compilerCore.NodeFlags.CatQuery).toBe(core.ɵNodeFlags.CatQuery);
      expect(compilerCore.NodeFlags.Types).toBe(core.ɵNodeFlags.Types);

      expect(compilerCore.DepFlags.None).toBe(core.ɵDepFlags.None);
      expect(compilerCore.DepFlags.SkipSelf).toBe(core.ɵDepFlags.SkipSelf);
      expect(compilerCore.DepFlags.Optional).toBe(core.ɵDepFlags.Optional);
      expect(compilerCore.DepFlags.Value).toBe(core.ɵDepFlags.Value);

      expect(compilerCore.ArgumentType.Inline).toBe(core.ɵArgumentType.Inline);
      expect(compilerCore.ArgumentType.Dynamic).toBe(core.ɵArgumentType.Dynamic);

      expect(compilerCore.BindingFlags.TypeElementAttribute)
          .toBe(core.ɵBindingFlags.TypeElementAttribute);
      expect(compilerCore.BindingFlags.TypeElementClass).toBe(core.ɵBindingFlags.TypeElementClass);
      expect(compilerCore.BindingFlags.TypeElementStyle).toBe(core.ɵBindingFlags.TypeElementStyle);
      expect(compilerCore.BindingFlags.TypeProperty).toBe(core.ɵBindingFlags.TypeProperty);
      expect(compilerCore.BindingFlags.SyntheticProperty)
          .toBe(core.ɵBindingFlags.SyntheticProperty);
      expect(compilerCore.BindingFlags.SyntheticHostProperty)
          .toBe(core.ɵBindingFlags.SyntheticHostProperty);
      expect(compilerCore.BindingFlags.CatSyntheticProperty)
          .toBe(core.ɵBindingFlags.CatSyntheticProperty);
      expect(compilerCore.BindingFlags.Types).toBe(core.ɵBindingFlags.Types);

      expect(compilerCore.QueryBindingType.First).toBe(core.ɵQueryBindingType.First);
      expect(compilerCore.QueryBindingType.All).toBe(core.ɵQueryBindingType.All);

      expect(compilerCore.QueryValueType.ElementRef).toBe(core.ɵQueryValueType.ElementRef);
      expect(compilerCore.QueryValueType.RenderElement).toBe(core.ɵQueryValueType.RenderElement);
      expect(compilerCore.QueryValueType.TemplateRef).toBe(core.ɵQueryValueType.TemplateRef);
      expect(compilerCore.QueryValueType.ViewContainerRef)
          .toBe(core.ɵQueryValueType.ViewContainerRef);
      expect(compilerCore.QueryValueType.Provider).toBe(core.ɵQueryValueType.Provider);

      expect(compilerCore.ViewFlags.None).toBe(core.ɵViewFlags.None);
      expect(compilerCore.ViewFlags.OnPush).toBe(core.ɵViewFlags.OnPush);
    });
  });
}

function compareRuntimeShape(a: any, b: any) {
  const keys = metadataKeys(a);
  expect(keys).toEqual(metadataKeys(b));
  keys.forEach(key => { expect(a[key]).toBe(b[key]); });
  // Need to check 'ngMetadataName' separately, as this is
  // on the prototype in @angular/core, but a regular property in @angular/compiler.
  expect(a.ngMetadataName).toBe(b.ngMetadataName);
}

function metadataKeys(a: any): string[] {
  return Object.keys(a).filter(prop => prop !== 'ngMetadataName' && !prop.startsWith('_')).sort();
}

function typeExtends<T1 extends T2, T2>() {}
