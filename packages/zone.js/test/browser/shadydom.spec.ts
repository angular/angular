/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

describe('shadydom', () => {
  const div = document.createElement('div');
  const text = document.createTextNode('text');
  const span = document.createElement('span');
  const fragment = document.createDocumentFragment();
  document.body.appendChild(div);
  document.body.appendChild(text);
  document.body.appendChild(span);
  document.body.appendChild(fragment);
  const targets = [
    {name: 'window', target: window}, {name: 'div', target: div}, {name: 'text', target: text},
    {name: 'span', target: span}, {name: 'document', target: document},
    {name: 'fragment', target: fragment}
  ];
  targets.forEach((t: any) => {
    it(`test for prototype ${t.name}`, () => {
      const target = t.target;
      const zone = Zone.current.fork({name: 'zone'});
      const logs: string[] = [];
      zone.run(() => {
        target.addEventListener('click', () => {
          logs.push(Zone.current.name);
        });
      });
      const event = document.createEvent('MouseEvent');
      event.initEvent('click', true, true);
      target.dispatchEvent(event);
      expect(logs).toEqual(['zone']);
    });
  });
});
