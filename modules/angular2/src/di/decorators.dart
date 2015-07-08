library angular2.di.decorators;

import 'metadata.dart';
export 'metadata.dart';

/**
 * {@link InjectMetadata}.
 */
class Inject extends InjectMetadata {
	const Inject(dynamic token): super(token);
}

/**
 * {@link OptionalMetadata}.
 */
class Optional extends OptionalMetadata {
 	const Optional(): super();
}

/**
 * {@link InjectableMetadata}.
 */
class Injectable extends InjectableMetadata {
	const Injectable([VisibilityMetadata visibility = unbounded]): super(visibility);
}

/**
 * {@link SelfMetadata}.
 */
class Self extends SelfMetadata {
	const Self(): super();
}

/**
 * {@link ParentMetadata}.
 */
class Parent extends ParentMetadata {
	const Parent({bool self}): super(self:self);
}

/**
 * {@link AncestorMetadata}.
 */
class Ancestor extends AncestorMetadata {
	const Ancestor({bool self}): super(self:self);
}

/**
 * {@link UnboundedMetadata}.
 */
class Unbounded extends UnboundedMetadata {
	const Unbounded({bool self}): super(self:self);
}