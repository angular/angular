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
    this.a.change.subscribe(() => console.log('On Change'));
    this.a.onOpen.subscribe(() => console.log('On Open'));
    this.a.onClose.subscribe(() => console.log('On Close'));

    this.b.align = 'end';
    this.c.extraClasses = ['x', 'y', 'z'];

    this.e.align = 'end';
    this.e.onAlignChanged.subscribe(() => console.log('Align Changed'));
    this.e.onOpen.subscribe(() => console.log('Open'));
    this.e.onClose.subscribe(() => console.log('Close'));
  }
}
