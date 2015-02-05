library angular.core.compiler.shadow_dom;

//TODO: merge this file with shadow_dom.es6 when the traspiler support creating const globals

import './shadow_dom_strategy.dart';
export './shadow_dom_strategy.dart';

const ShadowDomEmulated = const EmulatedShadowDomStrategy();
const ShadowDomNative = const NativeShadowDomStrategy();