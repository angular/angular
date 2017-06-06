library angular2.di.decorators;

import 'metadata.dart';
export 'metadata.dart';

/**
 * {@link InjectMetadata}.
 */
class Inject extends InjectMetadata {
  const Inject(dynamic token) : super(token);
}

/**
 * {@link OptionalMetadata}.
 */
class Optional extends OptionalMetadata {
  const Optional() : super();
}

/**
 * {@link InjectableMetadata}.
 */
class Injectable extends InjectableMetadata {
  const Injectable() : super();
}

/**
 * {@link SelfMetadata}.
 */
class Self extends SelfMetadata {
  const Self() : super();
}

/**
 * {@link HostMetadata}.
 */
class Host extends HostMetadata {
  const Host() : super();
}

/**
 * {@link SkipSelfMetadata}.
 */
class SkipSelf extends SkipSelfMetadata {
  const SkipSelf() : super();
}
