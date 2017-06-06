import { ViewContainerRef, TemplateRef } from 'angular2/core';
/**
 * Creates and inserts an embedded view based on a prepared `TemplateRef`.
 *
 * ### Syntax
 * - `<template [ngTemplateOutlet]="templateRefExpression"></template>`
 */
export declare class NgTemplateOutlet {
    private _viewContainerRef;
    private _insertedViewRef;
    constructor(_viewContainerRef: ViewContainerRef);
    ngTemplateOutlet: TemplateRef<Object>;
}
