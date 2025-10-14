/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getAppRoots} from './get-roots';
function createRoot() {
  const root = document.createElement('div');
  root.setAttribute('ng-version', '');
  return root;
}
describe('getRoots', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });
  it('should return root element', () => {
    const rootElement = createRoot();
    const childElement = createRoot();
    rootElement.appendChild(childElement);
    document.body.appendChild(rootElement);
    const roots = getAppRoots();
    expect(roots.length).toEqual(1);
    expect(roots.pop()).toEqual(rootElement);
  });
  it('should return root elements', () => {
    const firstRoot = createRoot();
    const secondRoot = createRoot();
    document.body.appendChild(firstRoot);
    document.body.appendChild(secondRoot);
    const roots = getAppRoots();
    expect(roots.length).toEqual(2);
    expect(roots).toContain(firstRoot);
    expect(roots).toContain(secondRoot);
  });
});
//# sourceMappingURL=get-roots.spec.js.map
