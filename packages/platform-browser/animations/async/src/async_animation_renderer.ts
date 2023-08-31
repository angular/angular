/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {ɵAnimationRendererFactory as AnimationRendererFactory, ɵAnimationRenderer as AnimationRenderer} from '@angular/animations/browser';
import {NgZone, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2} from '@angular/core';

/**
 * This alias narrows down to only the properties we need when lazy loading (or mock) the module
 */
type AnimationBrowserModuleImports =
    Pick<typeof import('@angular/animations/browser'), 'ɵcreateEngine'|'ɵAnimationRendererFactory'>;

export class AsyncAnimationRendererFactory implements RendererFactory2 {
  private _rendererFactoryPromise: Promise<AnimationRendererFactory>|null = null;

  /**
   *
   * @param moduleImpl allows to provide a mock implmentation (or will load the animation module)
   */
  constructor(
      private doc: Document, private delegate: RendererFactory2, private zone: NgZone,
      private animationType: 'animations'|'noop',
      private moduleImpl?: Promise<AnimationBrowserModuleImports>) {}

  /**
   * @internal
   */
  private loadImpl(): Promise<AnimationRendererFactory> {
    const moduleImpl = this.moduleImpl ?? import('@angular/animations/browser');

    return moduleImpl
        .catch((e) => {
          // TODO: Create a runtime error
          throw new Error('Failed to load the @angular/animations/browser module');
        })
        .then(({ɵcreateEngine, ɵAnimationRendererFactory}) => {
          // We can't create the renderer yet because we might need the hostElement and the type
          // Both are provided in createRenderer().
          const engine = ɵcreateEngine(this.animationType, this.doc);
          const rendererFactory = new ɵAnimationRendererFactory(this.delegate, engine, this.zone);
          this.delegate = rendererFactory;
          return rendererFactory;
        });
  }

  /**
   * This method is delegating the renderer creation to the factories.
   * It uses default factory while the animation factory isn't loaded
   * and will rely on the animation factory once it is loaded.
   *
   * Calling this method will trigger as side effect the loading of the animation module
   * if the renderered component uses animations.
   */
  createRenderer(hostElement: any, rendererType: RendererType2): Renderer2 {
    const renderer = this.delegate.createRenderer(hostElement, rendererType);

    if ((renderer as AnimationRenderer).isAnimationRenderer) {
      // The factory is already loaded, this is an animation renderer
      return renderer;
    }

    // We need to prevent the DomRenderer to throw an error because of synthetic properties
    if (typeof (renderer as any).throwOnSyntheticProps === 'boolean') {
      (renderer as any).throwOnSyntheticProps = false;
    }

    // Using a dynamic renderer to switch the renderer implementation once the module is loaded.
    const dynamicRenderer = new DynamicDelegationRenderer(renderer);

    // Kick off the module loading if the component uses animations but the module hasn't been
    // loaded yet.
    if (rendererType?.data?.['animation'] && !this._rendererFactoryPromise) {
      this._rendererFactoryPromise = this.loadImpl();
    }

    this._rendererFactoryPromise?.then((animationRendererFactory) => {
      const animationRenderer = animationRendererFactory.createRenderer(hostElement, rendererType);
      dynamicRenderer.use(animationRenderer);
    });

    return dynamicRenderer;
  }

  begin(): void {
    this.delegate.begin?.();
  }

  end(): void {
    this.delegate.end?.();
  }

  whenRenderingDone?(): Promise<any> {
    return this.delegate.whenRenderingDone?.() ?? Promise.resolve();
  }
}

/**
 * The class allows to dynamicly switch between different renderer implementations
 * by changing the delegate renderer.
 */
export class DynamicDelegationRenderer implements Renderer2 {
  constructor(private delegate: Renderer2) {}

  use(impl: Renderer2) {
    this.delegate = impl;
  }

  get data(): {[key: string]: any;} {
    return this.delegate.data;
  }

  destroy(): void {
    this.delegate.destroy();
  }

  createElement(name: string, namespace?: string|null) {
    return this.delegate.createElement(name, namespace);
  }

  createComment(value: string): void {
    return this.delegate.createComment(value);
  }

  createText(value: string): any {
    return this.delegate.createText(value);
  }

  get destroyNode(): ((node: any) => void)|null {
    return this.delegate.destroyNode;
  }

  appendChild(parent: any, newChild: any): void {
    this.delegate.appendChild(parent, newChild);
  }

  insertBefore(parent: any, newChild: any, refChild: any, isMove?: boolean|undefined): void {
    this.delegate.insertBefore(parent, newChild, refChild, isMove);
  }

  removeChild(parent: any, oldChild: any, isHostElement?: boolean|undefined): void {
    this.delegate.removeChild(parent, oldChild, isHostElement);
  }

  selectRootElement(selectorOrNode: any, preserveContent?: boolean|undefined): any {
    return this.delegate.selectRootElement(selectorOrNode, preserveContent);
  }

  parentNode(node: any): any {
    return this.delegate.parentNode(node);
  }

  nextSibling(node: any): any {
    return this.delegate.nextSibling(node);
  }

  setAttribute(el: any, name: string, value: string, namespace?: string|null|undefined): void {
    this.delegate.setAttribute(el, name, value, namespace);
  }

  removeAttribute(el: any, name: string, namespace?: string|null|undefined): void {
    this.delegate.removeAttribute(el, name, namespace);
  }

  addClass(el: any, name: string): void {
    this.delegate.addClass(el, name);
  }

  removeClass(el: any, name: string): void {
    this.delegate.removeClass(el, name);
  }

  setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2|undefined): void {
    this.delegate.setStyle(el, style, value, flags);
  }

  removeStyle(el: any, style: string, flags?: RendererStyleFlags2|undefined): void {
    this.delegate.removeStyle(el, style, flags);
  }

  setProperty(el: any, name: string, value: any): void {
    this.delegate.setProperty(el, name, value);
  }

  setValue(node: any, value: string): void {
    this.delegate.setValue(node, value);
  }

  listen(target: any, eventName: string, callback: (event: any) => boolean | void): () => void {
    return this.delegate.listen(target, eventName, callback);
  }
}
