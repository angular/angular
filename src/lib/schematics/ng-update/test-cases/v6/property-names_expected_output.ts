/*
 * Fake definitions because the property name rules can only determine the host type
 * properly by using type checking.
 */

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

class MatDrawer {
  align: any;
  onAlignChanged: any;
  onOpen: any;
  onClose: any;
}

/* Actual test case using the previously defined definitions. */

class A {
  self = {me: this};
  b: MatRadioGroup;

  constructor(private a: MatSelect,
              public c: MatSnackBarConfig,
              private e: MatDrawer) {}

  onClick() {
    this.a.selectionChange.subscribe(() => console.log('On Change'));
    this.a.openedChange.pipe(filter(isOpen => isOpen)).subscribe(() => console.log('On Open'));
    this.a.openedChange.pipe(filter(isOpen => !isOpen)).subscribe(() => console.log('On Close'));

    this.b.labelPosition = 'end';
    this.c.panelClass = ['x', 'y', 'z'];

    this.e.position = 'end';
    this.e.onPositionChanged.subscribe(() => console.log('Align Changed'));
    this.e.openedChange.pipe(filter(isOpen => isOpen)).subscribe(() => console.log('Open'));
    this.e.openedChange.pipe(filter(isOpen => !isOpen)).subscribe(() => console.log('Close'));
  }
}
