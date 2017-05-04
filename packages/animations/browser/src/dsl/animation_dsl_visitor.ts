/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationAnimateChildMetadata, AnimationAnimateMetadata, AnimationAnimateRefMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationMetadataType, AnimationQueryMetadata, AnimationReferenceMetadata, AnimationSequenceMetadata, AnimationStaggerMetadata, AnimationStateMetadata, AnimationStyleMetadata, AnimationTransitionMetadata, AnimationTriggerMetadata} from '@angular/animations';

export interface AnimationDslVisitor {
  visitTrigger(ast: AnimationTriggerMetadata, context: any): any;
  visitState(ast: AnimationStateMetadata, context: any): any;
  visitTransition(ast: AnimationTransitionMetadata, context: any): any;
  visitSequence(ast: AnimationSequenceMetadata, context: any): any;
  visitGroup(ast: AnimationGroupMetadata, context: any): any;
  visitAnimate(ast: AnimationAnimateMetadata, context: any): any;
  visitStyle(ast: AnimationStyleMetadata, context: any): any;
  visitKeyframes(ast: AnimationKeyframesSequenceMetadata, context: any): any;
  visitReference(ast: AnimationReferenceMetadata, context: any): any;
  visitAnimateChild(ast: AnimationAnimateChildMetadata, context: any): any;
  visitAnimateRef(ast: AnimationAnimateRefMetadata, context: any): any;
  visitQuery(ast: AnimationQueryMetadata, context: any): any;
  visitStagger(ast: AnimationStaggerMetadata, context: any): any;
}

export function visitAnimationNode(
    visitor: AnimationDslVisitor, node: AnimationMetadata, context: any) {
  switch (node.type) {
    case AnimationMetadataType.Trigger:
      return visitor.visitTrigger(node as AnimationTriggerMetadata, context);
    case AnimationMetadataType.State:
      return visitor.visitState(node as AnimationStateMetadata, context);
    case AnimationMetadataType.Transition:
      return visitor.visitTransition(node as AnimationTransitionMetadata, context);
    case AnimationMetadataType.Sequence:
      return visitor.visitSequence(node as AnimationSequenceMetadata, context);
    case AnimationMetadataType.Group:
      return visitor.visitGroup(node as AnimationGroupMetadata, context);
    case AnimationMetadataType.Animate:
      return visitor.visitAnimate(node as AnimationAnimateMetadata, context);
    case AnimationMetadataType.Keyframes:
      return visitor.visitKeyframes(node as AnimationKeyframesSequenceMetadata, context);
    case AnimationMetadataType.Style:
      return visitor.visitStyle(node as AnimationStyleMetadata, context);
    case AnimationMetadataType.Reference:
      return visitor.visitReference(node as AnimationReferenceMetadata, context);
    case AnimationMetadataType.AnimateChild:
      return visitor.visitAnimateChild(node as AnimationAnimateChildMetadata, context);
    case AnimationMetadataType.AnimateRef:
      return visitor.visitAnimateRef(node as AnimationAnimateRefMetadata, context);
    case AnimationMetadataType.Query:
      return visitor.visitQuery(node as AnimationQueryMetadata, context);
    case AnimationMetadataType.Stagger:
      return visitor.visitStagger(node as AnimationStaggerMetadata, context);
    default:
      throw new Error(`Unable to resolve animation metadata node #${node.type}`);
  }
}
