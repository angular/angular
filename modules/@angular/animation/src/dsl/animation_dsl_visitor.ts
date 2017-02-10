/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as meta from './animation_metadata';

export interface AnimationDslVisitor {
  visitState(ast: meta.AnimationStateMetadata, context: any): any;
  visitTransition(ast: meta.AnimationTransitionMetadata, context: any): any;
  visitSequence(ast: meta.AnimationSequenceMetadata, context: any): any;
  visitGroup(ast: meta.AnimationGroupMetadata, context: any): any;
  visitAnimate(ast: meta.AnimationAnimateMetadata, context: any): any;
  visitStyle(ast: meta.AnimationStyleMetadata, context: any): any;
  visitKeyframeSequence(ast: meta.AnimationKeyframesSequenceMetadata, context: any): any;
}

export function visitAnimationNode(
    visitor: AnimationDslVisitor, node: meta.AnimationMetadata, context: any) {
  switch (node.type) {
    case meta.AnimationMetadataType.State:
      return visitor.visitState(<meta.AnimationStateMetadata>node, context);
    case meta.AnimationMetadataType.Transition:
      return visitor.visitTransition(<meta.AnimationTransitionMetadata>node, context);
    case meta.AnimationMetadataType.Sequence:
      return visitor.visitSequence(<meta.AnimationSequenceMetadata>node, context);
    case meta.AnimationMetadataType.Group:
      return visitor.visitGroup(<meta.AnimationGroupMetadata>node, context);
    case meta.AnimationMetadataType.Animate:
      return visitor.visitAnimate(<meta.AnimationAnimateMetadata>node, context);
    case meta.AnimationMetadataType.KeyframeSequence:
      return visitor.visitKeyframeSequence(<meta.AnimationKeyframesSequenceMetadata>node, context);
    case meta.AnimationMetadataType.Style:
      return visitor.visitStyle(<meta.AnimationStyleMetadata>node, context);
    default:
      throw new Error(`Unable to resolve animation metadata node #${node.type}`);
  }
}
