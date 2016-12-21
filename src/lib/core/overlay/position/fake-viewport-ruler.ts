/** @docs-private */
export class FakeViewportRuler {
  getViewportRect() {
    return {
      left: 0, top: 0, width: 1014, height: 686, bottom: 686, right: 1014
    };
  }

  getViewportScrollPosition() {
    return {top: 0, left: 0};
  }
}
