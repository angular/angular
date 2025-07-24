/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Test MessagePort monkey patch.
 */
describe('MessagePort onproperties', () => {
  let iframe: any;
  beforeEach(() => {
    iframe = document.createElement('iframe');
    const html = `<body>
      <script>
      window.addEventListener('message', onMessage);
      function onMessage(e) {
        // Use the transferred port to post a message back to the main frame
  	    e.ports[0].postMessage('Message back from the IFrame');
      }
      </script>
    </body>`;
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
  });
  afterEach(() => {
    if (iframe) {
      document.body.removeChild(iframe);
    }
  });

  it('onmessge should in the zone', (done) => {
    const channel = new MessageChannel();
    const zone = Zone.current.fork({name: 'zone'});
    iframe.onload = function () {
      zone.run(() => {
        channel.port1.onmessage = function () {
          expect(Zone.current.name).toBe(zone.name);
          done();
        };
        Zone.current.fork({name: 'zone1'}).run(() => {
          iframe.contentWindow.postMessage('Hello from the main page!', '*', [channel.port2]);
        });
      });
    };
    document.body.appendChild(iframe);
  });
});
