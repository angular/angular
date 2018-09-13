/*
 * Fake definitions because the property name rules can only determine the host type
 * properly by using type checking.
 */

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

class MatSelect {
  change: any;
  onOpen: any;
  onClose: any;
}

class MatRadioGroup {
  align: any;
}

class MatSnackBarConfig {
  extraClasses: any;
}

class CdkPortalOutlet {
  _deprecatedPortal: any;
  _deprecatedPortalHost: any;
}

class MatDrawer {
  align: any;
  onAlignChanged: any;
  onOpen: any;
  onClose: any;
}

/* Actual test case using the previously defined definitions. */

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
  b: MatRadioGroup;

  constructor(private a: MatSelect,
              public c: MatSnackBarConfig,
              protected d: CdkPortalOutlet,
              private e: MatDrawer) {}

  onClick() {
    this.a.change.subscribe(() => console.log('On Change'));
    this.a.onOpen.subscribe(() => console.log('On Open'));
    this.a.onClose.subscribe(() => console.log('On Close'));

    this.b.align = 'end';
    this.c.extraClasses = ['x', 'y', 'z'];
    this.d._deprecatedPortal = this.d._deprecatedPortalHost = 'myNewPortal';

    this.e.align = 'end';
    this.e.onAlignChanged.subscribe(() => console.log('Align Changed'));
    this.e.onOpen.subscribe(() => console.log('Open'));
    this.e.onClose.subscribe(() => console.log('Close'));
  }
}
