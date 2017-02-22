/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationAnimateMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationMetadataType, AnimationSequenceMetadata, AnimationStateMetadata, AnimationStyleMetadata, AnimationTransitionMetadata} from '@angular/animations';

export interface AnimationDslVisitor {
  visitState(ast: AnimationStateMetadata, context: any): any;
  visitTransition(ast: AnimationTransitionMetadata, context: any): any;
  visitSequence(ast: AnimationSequenceMetadata, context: any): any;
  visitGroup(ast: AnimationGroupMetadata, context: any): any;
  visitAnimate(ast: AnimationAnimateMetadata, context: any): any;
  visitStyle(ast: AnimationStyleMetadata, context: any): any;
  visitKeyframeSequence(ast: AnimationKeyframesSequenceMetadata, context: any): any;
}

export function visitAnimationNode(
    visitor: AnimationDslVisitor, node: AnimationMetadata, context: any) {
  switch (node.type) {
    case AnimationMetadataType.State:
      return visitor.visitState(<AnimationStateMetadata>node, context);
    case AnimationMetadataType.Transition:
      return visitor.visitTransition(<AnimationTransitionMetadata>node, context);
    case AnimationMetadataType.Sequence:
      return visitor.visitSequence(<AnimationSequenceMetadata>node, context);
    case AnimationMetadataType.Group:
      return visitor.visitGroup(<AnimationGroupMetadata>node, context);
    case AnimationMetadataType.Animate:
      return visitor.visitAnimate(<AnimationAnimateMetadata>node, context);
    case AnimationMetadataType.KeyframeSequence:
      return visitor.visitKeyframeSequence(<AnimationKeyframesSequenceMetadata>node, context);
    case AnimationMetadataType.Style:
      return visitor.visitStyle(<AnimationStyleMetadata>node, context);
    default:
      throw new Error(`Unable to resolve animation metadata node #${node.type}`);
  }
}
