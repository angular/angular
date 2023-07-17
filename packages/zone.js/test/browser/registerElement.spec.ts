/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * check that document.registerElement(name, { prototype: proto });
 * is properly patched
 */

function registerElement() {
  return ('registerElement' in document) && (typeof customElements === 'undefined');
}

if (registerElement()) {
  describe('document.registerElement', function() {
    // register a custom element for each callback
    const callbackNames = ['created', 'attached', 'detached', 'attributeChanged'];
    const callbacks: any = {};
    const testZone = Zone.current.fork({name: 'test'});
    let customElements;

    customElements = testZone.run(function() {
      callbackNames.forEach(function(callbackName) {
        const fullCallbackName = callbackName + 'Callback';
        const proto = Object.create(HTMLElement.prototype);
        (proto as any)[fullCallbackName] = function(arg: any) {
          callbacks[callbackName](arg);
        };
        (<any>document).registerElement('x-' + callbackName.toLowerCase(), {prototype: proto});
      });
    });

    it('should work with createdCallback', function(done) {
      callbacks.created = function() {
        expect(Zone.current).toBe(testZone);
        done();
      };

      document.createElement('x-created');
    });


    it('should work with attachedCallback', function(done) {
      callbacks.attached = function() {
        expect(Zone.current).toBe(testZone);
        done();
      };

      const elt = document.createElement('x-attached');
      document.body.appendChild(elt);
      document.body.removeChild(elt);
    });


    it('should work with detachedCallback', function(done) {
      callbacks.detached = function() {
        expect(Zone.current).toBe(testZone);
        done();
      };

      const elt = document.createElement('x-detached');
      document.body.appendChild(elt);
      document.body.removeChild(elt);
    });


    it('should work with attributeChanged', function(done) {
      callbacks.attributeChanged = function() {
        expect(Zone.current).toBe(testZone);
        done();
      };

      const elt = document.createElement('x-attributechanged');
      elt.id = 'bar';
    });


    it('should work with non-writable, non-configurable prototypes created with defineProperty',
       function(done) {
         testZone.run(function() {
           const proto = Object.create(HTMLElement.prototype);

           Object.defineProperty(
               proto, 'createdCallback',
               <any>{writable: false, configurable: false, value: checkZone});

           (<any>document).registerElement('x-prop-desc', {prototype: proto});

           function checkZone() {
             expect(Zone.current).toBe(testZone);
             done();
           }
         });

         const elt = document.createElement('x-prop-desc');
       });


    it('should work with non-writable, non-configurable prototypes created with defineProperties',
       function(done) {
         testZone.run(function() {
           const proto = Object.create(HTMLElement.prototype);

           Object.defineProperties(proto, {
             createdCallback: <any> {
               writable: false, configurable: false, value: checkZone
             }
           });

           (<any>document).registerElement('x-props-desc', {prototype: proto});

           function checkZone() {
             expect(Zone.current).toBe(testZone);
             done();
           }
         });

         const elt = document.createElement('x-props-desc');
       });

    it('should not throw with frozen prototypes ', function() {
      testZone.run(function() {
        const proto = Object.create(HTMLElement.prototype, Object.freeze(<PropertyDescriptorMap>{
          createdCallback: <PropertyDescriptor> {
            value: () => {}, writable: true, configurable: true
          }
        }));

        Object.defineProperty(
            proto, 'createdCallback', <any>{writable: false, configurable: false});

        expect(function() {
          (<any>document).registerElement('x-frozen-desc', {prototype: proto});
        }).not.toThrow();
      });
    });


    it('should check bind callback if not own property', function(done) {
      testZone.run(function() {
        const originalProto = {createdCallback: checkZone};

        const secondaryProto = Object.create(originalProto);
        expect(secondaryProto.createdCallback).toBe(originalProto.createdCallback);

        (<any>document).registerElement('x-inherited-callback', {prototype: secondaryProto});
        expect(secondaryProto.createdCallback).not.toBe(originalProto.createdCallback);

        function checkZone() {
          expect(Zone.current).toBe(testZone);
          done();
        }

        const elt = document.createElement('x-inherited-callback');
      });
    });


    it('should not throw if no options passed to registerElement', function() {
      expect(function() {
        (<any>document).registerElement('x-no-opts');
      }).not.toThrow();
    });
  });
}
