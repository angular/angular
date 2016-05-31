require('reflect-metadata');
require('@angular/platform-server/src/parse5_adapter.js').Parse5DomAdapter.makeCurrent();
require('zone.js/dist/zone-node.js');
require('zone.js/dist/long-stack-trace-zone.js');

import {AnimateCmpNgFactory} from '../src/animate.ngfactory';
import {AUTO_STYLE, ReflectiveInjector, DebugElement, getDebugNode} from '@angular/core';
import {browserPlatform, BROWSER_APP_PROVIDERS} from '@angular/platform-browser';

describe("template codegen output", () => {
  it("should apply the animate states to the element", (done) => {
    const appInjector = ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS,
      browserPlatform().injector);
    var comp = AnimateCmpNgFactory.create(appInjector);
    var debugElement = <DebugElement>getDebugNode(comp.location.nativeElement);

    // the open-close-container is a child of the main container
    // if the template changes then please update the location below
    var targetDebugElement = <DebugElement>debugElement.children[3];

    comp.instance.setAsOpen();
    comp.changeDetectorRef.detectChanges();

    setTimeout(() => {
      expect(targetDebugElement.styles['height']).toEqual(AUTO_STYLE);
      expect(targetDebugElement.styles['borderColor']).toEqual('green');
      expect(targetDebugElement.styles['color']).toEqual('green');

      comp.instance.setAsClosed();
      comp.changeDetectorRef.detectChanges();

      setTimeout(() => {
        expect(targetDebugElement.styles['height']).toEqual("0px");
        expect(targetDebugElement.styles['borderColor']).toEqual('maroon');
        expect(targetDebugElement.styles['color']).toEqual('maroon');
        done();
      }, 0);
    }, 0);
  });
});
