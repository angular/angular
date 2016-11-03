/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, RenderComponentType, Renderer, RootRenderer} from '@angular/core';
import {DebugDomRenderer} from '@angular/core/src/debug/debug_renderer';
import {DirectRenderer} from '@angular/core/src/render/api';
import {TestBed, inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DIRECT_DOM_RENDERER, DomRootRenderer} from '@angular/platform-browser/src/dom/dom_renderer';
import {expect} from '@angular/platform-browser/testing/matchers';

let directRenderer: any;
let destroyViewLogs: any[];

export function main() {
  // Don't run on server...
  if (!getDOM().supportsDOMEvents()) return;
  describe('direct dom integration tests', function() {

    beforeEach(() => {
      directRenderer = DIRECT_DOM_RENDERER;
      destroyViewLogs = [];
      spyOn(directRenderer, 'remove').and.callThrough();
      spyOn(directRenderer, 'appendChild').and.callThrough();
      spyOn(directRenderer, 'insertBefore').and.callThrough();

      TestBed.configureTestingModule(
          {providers: [{provide: RootRenderer, useClass: DirectRootRenderer}]});
    });

    it('should attach views as last nodes in a parent', () => {
      @Component({template: '<div *ngIf="true">hello</div>'})
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [MyComp]});

      const fixture = TestBed.createComponent(MyComp);

      directRenderer.insertBefore.calls.reset();
      directRenderer.appendChild.calls.reset();

      fixture.detectChanges();

      expect(fixture.nativeElement).toHaveText('hello');
      expect(directRenderer.insertBefore).not.toHaveBeenCalled();
      expect(directRenderer.appendChild).toHaveBeenCalled();
    });

    it('should attach views as non last nodes in a parent', () => {
      @Component({template: '<div *ngIf="true">hello</div>after'})
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [MyComp]});

      const fixture = TestBed.createComponent(MyComp);

      directRenderer.insertBefore.calls.reset();
      directRenderer.appendChild.calls.reset();

      fixture.detectChanges();

      expect(fixture.nativeElement).toHaveText('helloafter');
      expect(directRenderer.insertBefore).toHaveBeenCalled();
      expect(directRenderer.appendChild).not.toHaveBeenCalled();
    });

    it('should detach views', () => {
      @Component({template: '<div *ngIf="shown">hello</div>'})
      class MyComp {
        shown = true;
      }

      TestBed.configureTestingModule({declarations: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      directRenderer.remove.calls.reset();

      fixture.componentInstance.shown = false;
      fixture.detectChanges();

      expect(fixture.nativeElement).toHaveText('');
      expect(directRenderer.remove).toHaveBeenCalled();
    });

    it('should pass null as all nodes to destroyView', () => {
      @Component({template: '<div *ngIf="shown">hello</div>'})
      class MyComp {
        shown = true;
      }

      TestBed.configureTestingModule({declarations: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      destroyViewLogs.length = 0;

      fixture.componentInstance.shown = false;
      fixture.detectChanges();

      expect(destroyViewLogs).toEqual([[null, null]]);
    });

    it('should project nodes', () => {
      @Component({template: '<child>hello</child>'})
      class Parent {
      }

      @Component({selector: 'child', template: '(<ng-content></ng-content>)'})
      class Child {
      }

      TestBed.configureTestingModule({declarations: [Parent, Child]});
      const fixture = TestBed.createComponent(Parent);

      expect(fixture.nativeElement).toHaveText('(hello)');
      const childHostEl = fixture.nativeElement.children[0];
      const projectedNode = childHostEl.childNodes[1];
      expect(directRenderer.appendChild).toHaveBeenCalledWith(projectedNode, childHostEl);
    });
  });
}

@Injectable()
class DirectRootRenderer implements RootRenderer {
  constructor(private _delegate: DomRootRenderer) {}
  renderComponent(componentType: RenderComponentType): Renderer {
    const renderer = new DebugDomRenderer(this._delegate.renderComponent(componentType));
    (renderer as any).directRenderer = directRenderer;
    const originalDestroyView = renderer.destroyView;
    renderer.destroyView = function(...args: any[]) {
      destroyViewLogs.push(args);
      return originalDestroyView.apply(this, args);
    };
    return renderer;
  }
}
