library angular2.src.common.forms.directives.control_container;

import "form_interface.dart" show Form;
import "abstract_control_directive.dart" show AbstractControlDirective;

/**
 * A directive that contains multiple [NgControl]s.
 *
 * Only used by the forms module.
 */
class ControlContainer extends AbstractControlDirective {
  String name;
  /**
   * Get the form to which this container belongs.
   */
  Form get formDirective {
    return null;
  }

  /**
   * Get the path to this container.
   */
  List<String> get path {
    return null;
  }
}
