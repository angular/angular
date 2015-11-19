/**
 * @module
 * @description
 * Starting point to import all public core APIs.
 */
library angular2.core;

export "src/core/metadata.dart";
export "src/core/util.dart";
export "src/core/dev_mode.dart";
export "src/core/di.dart";
export "src/facade/facade.dart";
export "src/core/application_ref.dart"
    show platform, createNgZone, PlatformRef, ApplicationRef;
export "src/core/application_tokens.dart"
    show APP_ID, APP_COMPONENT, APP_INITIALIZER, PLATFORM_INITIALIZER;
export "src/core/zone.dart";
export "src/core/render.dart";
export "src/core/linker.dart";
export "src/core/debug/debug_element.dart"
    show DebugElement, Scope, inspectElement, asNativeElements;
export "src/core/testability/testability.dart";
export "src/core/change_detection.dart";
export "src/core/platform_directives_and_pipes.dart";
export "src/core/platform_common_providers.dart";
export "src/core/application_common_providers.dart";
export "src/core/reflection/reflection.dart";
export "src/core/dom/dom_adapter.dart";
