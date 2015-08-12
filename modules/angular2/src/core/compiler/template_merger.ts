import {isPresent} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Injectable} from 'angular2/di';
import {RenderProtoViewRef, Renderer, RenderTemplateCmdType} from 'angular2/render';

import {EmbeddedTemplateCmd, TemplateCmd, BeginElementCmd, BeginComponentCmd, isBeginElement} from './template_commands';
import {TemplateRegistry} from './template_registry';
import {AppProtoViewMergeMapping} from './view';

// TODO: Cache per component?!

export class MergeResult {
  constructor(
    public nestedViewIndicesByElementIndex: number[],
    public hostElementIndicesByViewIndex: number[],
    public nestedViewCountByViewIndex: number[],
    public sharedStyles:string[],
    public fragments:TemplateCmd[][]) {}
}

export function mergeTemplates(templateRegistry: TemplateRegistry, template:TemplateCmd[]):MergeResult {
  var merger = new TemplateMerger(templateRegistry, template);
  merger.merge();
  var nestedViewIndicesByElementIndex =
      inverseIndexMapping(merger.hostElementIndicesByViewIndex, merger.boundAppElementCount);
  var nestedViewCountByViewIndex: number[] = calcNestedViewCounts(merger.parentViewIndexByViewIndex);  
  return new MergeResult(nestedViewIndicesByElementIndex, merger.hostElementIndicesByViewIndex, nestedViewCountByViewIndex, merger.sharedStyles, merger.fragments);
}

class TemplateMerger {
  viewCount: number = 0;
  boundAppElementCount: number = 0;
  fragments: TemplateCmd[][] = [];
  hostElementIndicesByViewIndex: number[] = [];
  parentViewIndexByViewIndex: number[] = [];  
  sharedStyles: string[];
  
  constructor(private templateRegistry:TemplateRegistry, startTemplate:TemplateCmd[]) {
    this.fragments = [startTemplate];    
  }
  
  merge() {
    for (var viewIdx=0; viewIdx<this.fragments.length; viewIdx++) {
      var fragment = this.fragments[viewIdx];
      if (isPresent(fragment)) {
        this._mergeSingleTemplate(fragment, viewIdx);
      }
    }
    return this.fragments;    
  }
  
  private _mergeSingleTemplate(template:TemplateCmd[], viewIndex:number) {
    for (var cmdIdx = 0; cmdIdx<template.length; cmdIdx++) {
      var cmd = template[cmdIdx];
      var type = cmd.type;
      if (isBeginElement(type)) {
        var bec = <BeginElementCmd> cmd;            
        if (bec.isBound) {
          this.boundAppElementCount++;
        } 
        if (type === RenderTemplateCmdType.BEGIN_COMPONENT) {
          var bc = <BeginComponentCmd> cmd;
          var styles = this.templateRegistry.getSharedStyles(bc.templateId);
          for (var i=0; i<styles.length; i++) {
            this.sharedStyles.push(styles[i]);
          }          
          this._pushNestedTemplate(this.templateRegistry.getTemplate(bc.templateId), viewIndex, this.boundAppElementCount);          
        } else if (type === RenderTemplateCmdType.TEMPLATE_ANCHOR) {
          var etc = <EmbeddedTemplateCmd> cmd;
          if (etc.transitiveNgContentCount > 0) {
            this._pushNestedTemplate(etc.content, viewIndex, this.boundAppElementCount);                      
          } else {
            this.fragments.push(null);
          }
        }
      }   
    }    
  }
  
  _pushNestedTemplate(template:TemplateCmd[], parentViewIndex = null, parentBoundElementIndex:number = null) {
    this.viewCount++;    
    this.hostElementIndicesByViewIndex.push(this.viewCount-1, parentBoundElementIndex);
    this.parentViewIndexByViewIndex.push(this.viewCount-1, parentViewIndex);
    this.fragments.push(template);
  }
}

function inverseIndexMapping(input: number[], resultLength: number): number[] {
  var result = ListWrapper.createGrowableSize(resultLength);
  for (var i = 0; i < input.length; i++) {
    var value = input[i];
    if (isPresent(value)) {
      result[input[i]] = i;
    }
  }
  return result;
}

function calcNestedViewCounts(parentViewIndices: number[]): number[] {
  var nestedViewCounts = ListWrapper.createFixedSize(parentViewIndices.length);
  ListWrapper.fill(nestedViewCounts, 0);
  for (var viewIdx = parentViewIndices.length - 1; viewIdx >= 1; viewIdx--) {
    var parentViewIdx = parentViewIndices[viewIdx];
    if (isPresent(parentViewIdx)) {
      nestedViewCounts[parentViewIdx] += nestedViewCounts[viewIdx] + 1;
    }
  }
  return nestedViewCounts;
}
