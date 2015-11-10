library angular2.src.common.forms.directives.ng_control_status;

import "package:angular2/src/core/metadata.dart" show Directive;
import "package:angular2/src/core/di.dart" show Self;
import "ng_control.dart" show NgControl;
import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;

@Directive(
    selector: "[ng-control],[ng-model],[ng-form-control]",
    host: const {
      "[class.ng-untouched]": "ngClassUntouched",
      "[class.ng-touched]": "ngClassTouched",
      "[class.ng-pristine]": "ngClassPristine",
      "[class.ng-dirty]": "ngClassDirty",
      "[class.ng-valid]": "ngClassValid",
      "[class.ng-invalid]": "ngClassInvalid"
    })
class NgControlStatus {
  NgControl _cd;
  NgControlStatus(@Self() NgControl cd) {
    this._cd = cd;
  }
  bool get ngClassUntouched {
    return isPresent(this._cd.control) ? this._cd.control.untouched : false;
  }

  bool get ngClassTouched {
    return isPresent(this._cd.control) ? this._cd.control.touched : false;
  }

  bool get ngClassPristine {
    return isPresent(this._cd.control) ? this._cd.control.pristine : false;
  }

  bool get ngClassDirty {
    return isPresent(this._cd.control) ? this._cd.control.dirty : false;
  }

  bool get ngClassValid {
    return isPresent(this._cd.control) ? this._cd.control.valid : false;
  }

  bool get ngClassInvalid {
    return isPresent(this._cd.control) ? !this._cd.control.valid : false;
  }
}
