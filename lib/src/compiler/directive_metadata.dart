library angular2.src.compiler.directive_metadata;

import "package:angular2/src/facade/lang.dart"
    show
        isPresent,
        isBlank,
        normalizeBool,
        serializeEnum,
        Type,
        RegExpWrapper,
        StringWrapper;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES;
import "package:angular2/src/core/metadata/view.dart"
    show ViewEncapsulation, VIEW_ENCAPSULATION_VALUES;
import "package:angular2/src/compiler/selector.dart" show CssSelector;
import "util.dart" show splitAtColon;
import "package:angular2/src/core/linker/interfaces.dart"
    show LifecycleHooks, LIFECYCLE_HOOKS_VALUES;
// group 1: "property" from "[property]"

// group 2: "event" from "(event)"
var HOST_REG_EXP = new RegExp(r'^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))$');

/**
 * Metadata regarding compilation of a type.
 */
class CompileTypeMetadata {
  Type runtime;
  String name;
  String moduleUrl;
  bool isHost;
  CompileTypeMetadata({runtime, name, moduleUrl, isHost}) {
    this.runtime = runtime;
    this.name = name;
    this.moduleUrl = moduleUrl;
    this.isHost = normalizeBool(isHost);
  }
  static CompileTypeMetadata fromJson(Map<String, dynamic> data) {
    return new CompileTypeMetadata(
        name: data["name"],
        moduleUrl: data["moduleUrl"],
        isHost: data["isHost"]);
  }

  Map<String, dynamic> toJson() {
    return {
      // Note: Runtime type can't be serialized...
      "name": this.name, "moduleUrl": this.moduleUrl, "isHost": this.isHost
    };
  }
}

/**
 * Metadata regarding compilation of a template.
 */
class CompileTemplateMetadata {
  ViewEncapsulation encapsulation;
  String template;
  String templateUrl;
  List<String> styles;
  List<String> styleUrls;
  List<String> ngContentSelectors;
  CompileTemplateMetadata(
      {encapsulation,
      template,
      templateUrl,
      styles,
      styleUrls,
      ngContentSelectors}) {
    this.encapsulation =
        isPresent(encapsulation) ? encapsulation : ViewEncapsulation.Emulated;
    this.template = template;
    this.templateUrl = templateUrl;
    this.styles = isPresent(styles) ? styles : [];
    this.styleUrls = isPresent(styleUrls) ? styleUrls : [];
    this.ngContentSelectors =
        isPresent(ngContentSelectors) ? ngContentSelectors : [];
  }
  static CompileTemplateMetadata fromJson(Map<String, dynamic> data) {
    return new CompileTemplateMetadata(
        encapsulation: isPresent(data["encapsulation"])
            ? VIEW_ENCAPSULATION_VALUES[data["encapsulation"]]
            : data["encapsulation"],
        template: data["template"],
        templateUrl: data["templateUrl"],
        styles: data["styles"],
        styleUrls: data["styleUrls"],
        ngContentSelectors: data["ngContentSelectors"]);
  }

  Map<String, dynamic> toJson() {
    return {
      "encapsulation": isPresent(this.encapsulation)
          ? serializeEnum(this.encapsulation)
          : this.encapsulation,
      "template": this.template,
      "templateUrl": this.templateUrl,
      "styles": this.styles,
      "styleUrls": this.styleUrls,
      "ngContentSelectors": this.ngContentSelectors
    };
  }
}

/**
 * Metadata regarding compilation of a directive.
 */
class CompileDirectiveMetadata {
  static CompileDirectiveMetadata create(
      {type,
      isComponent,
      dynamicLoadable,
      selector,
      exportAs,
      changeDetection,
      inputs,
      outputs,
      host,
      lifecycleHooks,
      template}) {
    Map<String, String> hostListeners = {};
    Map<String, String> hostProperties = {};
    Map<String, String> hostAttributes = {};
    if (isPresent(host)) {
      StringMapWrapper.forEach(host, (String value, String key) {
        var matches = RegExpWrapper.firstMatch(HOST_REG_EXP, key);
        if (isBlank(matches)) {
          hostAttributes[key] = value;
        } else if (isPresent(matches[1])) {
          hostProperties[matches[1]] = value;
        } else if (isPresent(matches[2])) {
          hostListeners[matches[2]] = value;
        }
      });
    }
    Map<String, String> inputsMap = {};
    if (isPresent(inputs)) {
      inputs.forEach((String bindConfig) {
        // canonical syntax: `dirProp: elProp`

        // if there is no `:`, use dirProp = elProp
        var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        inputsMap[parts[0]] = parts[1];
      });
    }
    Map<String, String> outputsMap = {};
    if (isPresent(outputs)) {
      outputs.forEach((String bindConfig) {
        // canonical syntax: `dirProp: elProp`

        // if there is no `:`, use dirProp = elProp
        var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        outputsMap[parts[0]] = parts[1];
      });
    }
    return new CompileDirectiveMetadata(
        type: type,
        isComponent: normalizeBool(isComponent),
        dynamicLoadable: normalizeBool(dynamicLoadable),
        selector: selector,
        exportAs: exportAs,
        changeDetection: changeDetection,
        inputs: inputsMap,
        outputs: outputsMap,
        hostListeners: hostListeners,
        hostProperties: hostProperties,
        hostAttributes: hostAttributes,
        lifecycleHooks: isPresent(lifecycleHooks) ? lifecycleHooks : [],
        template: template);
  }

  CompileTypeMetadata type;
  bool isComponent;
  bool dynamicLoadable;
  String selector;
  String exportAs;
  ChangeDetectionStrategy changeDetection;
  Map<String, String> inputs;
  Map<String, String> outputs;
  Map<String, String> hostListeners;
  Map<String, String> hostProperties;
  Map<String, String> hostAttributes;
  List<LifecycleHooks> lifecycleHooks;
  CompileTemplateMetadata template;
  CompileDirectiveMetadata(
      {type,
      isComponent,
      dynamicLoadable,
      selector,
      exportAs,
      changeDetection,
      inputs,
      outputs,
      hostListeners,
      hostProperties,
      hostAttributes,
      lifecycleHooks,
      template}) {
    this.type = type;
    this.isComponent = isComponent;
    this.dynamicLoadable = dynamicLoadable;
    this.selector = selector;
    this.exportAs = exportAs;
    this.changeDetection = changeDetection;
    this.inputs = inputs;
    this.outputs = outputs;
    this.hostListeners = hostListeners;
    this.hostProperties = hostProperties;
    this.hostAttributes = hostAttributes;
    this.lifecycleHooks = lifecycleHooks;
    this.template = template;
  }
  static CompileDirectiveMetadata fromJson(Map<String, dynamic> data) {
    return new CompileDirectiveMetadata(
        isComponent: data["isComponent"],
        dynamicLoadable: data["dynamicLoadable"],
        selector: data["selector"],
        exportAs: data["exportAs"],
        type: isPresent(data["type"])
            ? CompileTypeMetadata.fromJson(data["type"])
            : data["type"],
        changeDetection: isPresent(data["changeDetection"])
            ? CHANGE_DETECTION_STRATEGY_VALUES[data["changeDetection"]]
            : data["changeDetection"],
        inputs: data["inputs"],
        outputs: data["outputs"],
        hostListeners: data["hostListeners"],
        hostProperties: data["hostProperties"],
        hostAttributes: data["hostAttributes"],
        lifecycleHooks: ((data["lifecycleHooks"] as List<dynamic>))
            .map((hookValue) => LIFECYCLE_HOOKS_VALUES[hookValue])
            .toList(),
        template: isPresent(data["template"])
            ? CompileTemplateMetadata.fromJson(data["template"])
            : data["template"]);
  }

  Map<String, dynamic> toJson() {
    return {
      "isComponent": this.isComponent,
      "dynamicLoadable": this.dynamicLoadable,
      "selector": this.selector,
      "exportAs": this.exportAs,
      "type": isPresent(this.type) ? this.type.toJson() : this.type,
      "changeDetection": isPresent(this.changeDetection)
          ? serializeEnum(this.changeDetection)
          : this.changeDetection,
      "inputs": this.inputs,
      "outputs": this.outputs,
      "hostListeners": this.hostListeners,
      "hostProperties": this.hostProperties,
      "hostAttributes": this.hostAttributes,
      "lifecycleHooks":
          this.lifecycleHooks.map((hook) => serializeEnum(hook)).toList(),
      "template":
          isPresent(this.template) ? this.template.toJson() : this.template
    };
  }
}

/**
 * Construct [CompileDirectiveMetadata] from [ComponentTypeMetadata] and a selector.
 */
CompileDirectiveMetadata createHostComponentMeta(
    CompileTypeMetadata componentType, String componentSelector) {
  var template =
      CssSelector.parse(componentSelector)[0].getMatchingElementTemplate();
  return CompileDirectiveMetadata.create(
      type: new CompileTypeMetadata(
          runtime: Object,
          name: '''Host${ componentType . name}''',
          moduleUrl: componentType.moduleUrl,
          isHost: true),
      template: new CompileTemplateMetadata(
          template: template,
          templateUrl: "",
          styles: [],
          styleUrls: [],
          ngContentSelectors: []),
      changeDetection: ChangeDetectionStrategy.Default,
      inputs: [],
      outputs: [],
      host: {},
      lifecycleHooks: [],
      isComponent: true,
      dynamicLoadable: false,
      selector: "*");
}
