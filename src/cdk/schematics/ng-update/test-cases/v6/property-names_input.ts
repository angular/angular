class CdkConnectedOverlay {
  _deprecatedOrigin: any;
  _deprecatedPositions: any;
  _deprecatedOffsetX: any;
  _deprecatedOffsetY: any;
  _deprecatedWidth: any;
  _deprecatedHeight: any;
  _deprecatedMinWidth: any;
  _deprecatedMinHeight: any;
  _deprecatedBackdropClass: any;
  _deprecatedScrollStrategy: any;
  _deprecatedOpen: any;
  _deprecatedHasBackdrop: any;
}

class CdkPortalOutlet {
  _deprecatedPortal: any;
  _deprecatedPortalHost: any;
}

class A {
  self = {me: this};

  constructor(private a: CdkConnectedOverlay) {}

  onAngularClick() {
    this.a._deprecatedOrigin = '1';
    this.a._deprecatedPositions = '2';
    this.a._deprecatedOffsetX = '3';
    this.a._deprecatedOffsetY = '4';
    this.a._deprecatedHeight = '5';

    console.log(this.a._deprecatedWidth || 10);
    console.log(this.a._deprecatedMinWidth || this.a._deprecatedMinHeight);

    this.self.me.a._deprecatedBackdropClass = ['a', 'b', 'c'];

    const x = ({test: true} || this.a);

    if (this.isConnectedOverlay(x)) {
      x._deprecatedScrollStrategy = 'myScrollStrategy';
      x._deprecatedOpen = false;
      x._deprecatedHasBackdrop = true;
    }
  }

  isConnectedOverlay(val: any): val is CdkConnectedOverlay {
    return val instanceof CdkConnectedOverlay;
  }
}

class B {
  self = {me: this};

  constructor(protected a: CdkPortalOutlet) {}

  onClick() {
    this.a._deprecatedPortal = this.a._deprecatedPortalHost = 'myNewPortal';

    if (this.self.me.a) {
      console.log(this.a._deprecatedPortalHost || this.self.me.a._deprecatedPortal);
    }
  }
}