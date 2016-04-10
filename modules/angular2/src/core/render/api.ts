import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {Injector, Injectable} from 'angular2/src/core/di';

export class RenderComponentType {
  constructor(public id: string, public encapsulation: ViewEncapsulation,
              public styles: Array<string | any[]>) {}
}

export class RenderDebugInfo {
  constructor(public injector: Injector, public component: any, public providerTokens: any[],
              public locals: Map<string, any>) {}
}

export interface ParentRenderer { renderComponent(componentType: RenderComponentType): Renderer; }

export abstract class Renderer implements ParentRenderer {
  abstract renderComponent(componentType: RenderComponentType): Renderer;

  abstract selectRootElement(selector: string): any;

  abstract createElement(parentElement: any, name: string): any;

  abstract createViewRoot(hostElement: any): any;

  abstract createTemplateAnchor(parentElement: any): any;

  abstract createText(parentElement: any, value: string): any;

  abstract projectNodes(parentElement: any, nodes: any[]): void;

  abstract attachViewAfter(node: any, viewRootNodes: any[]): void;

  abstract detachView(viewRootNodes: any[]): void;

  abstract destroyView(hostElement: any, viewAllNodes: any[]): void;

  abstract listen(renderElement: any, name: string, callback: Function): Function;

  abstract listenGlobal(target: string, name: string, callback: Function): Function;

  abstract setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;

  abstract setElementAttribute(renderElement: any, attributeName: string,
                               attributeValue: string): void;

  /**
   * Used only in debug mode to serialize property changes to comment nodes,
   * such as <template> placeholders.
   */
  abstract setBindingDebugInfo(renderElement: any, propertyName: string,
                               propertyValue: string): void;

  abstract setElementDebugInfo(renderElement: any, info: RenderDebugInfo);

  abstract setElementClass(renderElement: any, className: string, isAdd: boolean);

  abstract setElementStyle(renderElement: any, styleName: string, styleValue: string);

  abstract invokeElementMethod(renderElement: any, methodName: string, args: any[]);

  abstract setText(renderNode: any, text: string);
}

/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
 */

export abstract class RootRenderer implements ParentRenderer {
  abstract renderComponent(componentType: RenderComponentType): Renderer;
}
