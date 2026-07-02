/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AnimationAnimateChildMetadata,
  AnimationAnimateMetadata,
  AnimationAnimateRefMetadata,
  AnimationGroupMetadata,
  AnimationKeyframesSequenceMetadata,
  AnimationQueryMetadata,
  AnimationReferenceMetadata,
  AnimationSequenceMetadata,
  AnimationStaggerMetadata,
  AnimationStateMetadata,
  AnimationStyleMetadata,
  AnimationTransitionMetadata,
  AnimationTriggerMetadata,
} from '../../../src/animations';

export interface AnimationDslVisitor {
  visitTrigger(node: AnimationTriggerMetadata, context: any): any;
  visitState(node: AnimationStateMetadata, context: any): any;
  visitTransition(node: AnimationTransitionMetadata, context: any): any;
  visitSequence(node: AnimationSequenceMetadata, context: any): any;
  visitGroup(node: AnimationGroupMetadata, context: any): any;
  visitAnimate(node: AnimationAnimateMetadata, context: any): any;
  visitStyle(node: AnimationStyleMetadata, context: any): any;
  visitKeyframes(node: AnimationKeyframesSequenceMetadata, context: any): any;
  visitReference(node: AnimationReferenceMetadata, context: any): any;
  visitAnimateChild(node: AnimationAnimateChildMetadata, context: any): any;
  visitAnimateRef(node: AnimationAnimateRefMetadata, context: any): any;
  visitQuery(node: AnimationQueryMetadata, context: any): any;
  visitStagger(node: AnimationStaggerMetadata, context: any): any;
}
