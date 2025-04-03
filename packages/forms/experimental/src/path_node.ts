import {FieldContext, FieldPath, LogicFn} from './api/types';
import {FormFieldImpl} from './field_node';
import {FormLogic, INDEX} from './logic_node';

/**
 * Special key which is used to retrieve the `FormLogic` instance from its `FormPath` proxy wrapper.
 */
const LOGIC = Symbol('LOGIC');

export interface Predicate {
  readonly fn: LogicFn<any, boolean>;
  readonly path: FieldPath<any>;
}

export class FormPathImpl {
  private readonly children = new Map<PropertyKey, FormPathImpl>();

  readonly formPathProxy: FieldPath<any> = new Proxy(
    this,
    FORM_PATH_PROXY_HANDLER,
  ) as unknown as FieldPath<any>;
  private constructor(
    readonly logic: FormLogic,
    readonly key: symbol,
    readonly predicate: Predicate | undefined,
  ) {}

  get element(): FormPathImpl {
    return this.getChild(INDEX);
  }

  maybeWrapWithPredicate<TValue, TReturn>(
    logicFn: LogicFn<TValue, TReturn>,
    defaultValue: TReturn,
  ): LogicFn<TValue, TReturn> {
    const predicate = this.predicate;
    if (!predicate) {
      return logicFn;
    }

    return (arg: FieldContext<any>): TReturn => {
      const predicateField = arg.resolve(predicate.path).$state as FormFieldImpl;
      if (!predicate.fn(predicateField.logicArgument)) {
        // don't actually run the user function
        return defaultValue;
      }
      return logicFn(arg);
    };
  }

  getChild(key: PropertyKey): FormPathImpl {
    if (!this.children.has(key)) {
      this.children.set(key, new FormPathImpl(this.logic.getChild(key), this.key, this.predicate));
    }
    return this.children.get(key)!;
  }

  withPredicate(predicate: Predicate): FormPathImpl {
    return new FormPathImpl(this.logic, Symbol(), predicate);
  }

  withNewKey(): FormPathImpl {
    return new FormPathImpl(this.logic, Symbol(), this.predicate);
  }

  static extractFromPath(formPath: FieldPath<unknown>): FormPathImpl {
    return (formPath as any)[LOGIC] as FormPathImpl;
  }

  static newRoot(): FormPathImpl {
    return new FormPathImpl(FormLogic.newRoot(), Symbol(), undefined);
  }
}

/**
 * Proxy handler which implements `FormPath` on top of a `LogicNode`.
 */
export const FORM_PATH_PROXY_HANDLER: ProxyHandler<FormPathImpl> = {
  get(node: FormPathImpl, property: string | symbol) {
    if (property === LOGIC) {
      return node;
    }

    return node.getChild(property).formPathProxy;
  },
};
