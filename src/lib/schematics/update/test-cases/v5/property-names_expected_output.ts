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
  b: MatRadioGroup;

  constructor(private a: MatSelect,
              public c: MatSnackBarConfig,
              protected d: CdkPortalOutlet,
              private e: MatDrawer) {}

  onClick() {
    this.a.selectionChange.subscribe(() => console.log('On Change'));
    this.a.openedChange.pipe(filter(isOpen => isOpen)).subscribe(() => console.log('On Open'));
    this.a.openedChange.pipe(filter(isOpen => !isOpen)).subscribe(() => console.log('On Close'));

    this.b.labelPosition = 'end';
    this.c.panelClass = ['x', 'y', 'z'];
    this.d.portal = this.d.portal = 'myNewPortal';

    this.e.position = 'end';
    this.e.onPositionChanged.subscribe(() => console.log('Align Changed'));
    this.e.openedChange.pipe(filter(isOpen => isOpen)).subscribe(() => console.log('Open'));
    this.e.openedChange.pipe(filter(isOpen => !isOpen)).subscribe(() => console.log('Close'));
  }
}
