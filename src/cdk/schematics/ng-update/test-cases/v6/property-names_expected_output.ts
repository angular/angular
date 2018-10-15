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
    this.a.origin = '1';
    this.a.positions = '2';
    this.a.offsetX = '3';
    this.a.offsetY = '4';
    this.a.height = '5';

    console.log(this.a.width || 10);
    console.log(this.a.minWidth || this.a.minHeight);

    this.self.me.a.backdropClass = ['a', 'b', 'c'];

    const x = ({test: true} || this.a);

    if (this.isConnectedOverlay(x)) {
      x.scrollStrategy = 'myScrollStrategy';
      x.open = false;
      x.hasBackdrop = true;
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
    this.a.portal = this.a.portal = 'myNewPortal';

    if (this.self.me.a) {
      console.log(this.a.portal || this.self.me.a.portal);
    }
  }
}