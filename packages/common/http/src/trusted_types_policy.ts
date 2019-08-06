/// <reference types="trusted-types" />

let policy: Pick<TrustedTypePolicy, 'name'|'createScriptURL'>;

/**
* Turns the value to trusted HTML. If the application uses Trusted Types the
* value is transformed into TrustedHTML, which can be assigned to execution
* sink. If the application doesn't use Trusted Types, the return value is the
* same as the argument.
*/
export function dangerouslyTurnToTrustedScriptURL(value: string): string|TrustedScriptURL {
  if (!policy && TrustedTypes !== undefined) {
    policy = TrustedTypes.createPolicy('common-http-jsonp', {createScriptURL: (s: string) => s});
  }

  if (!policy) {
    return value;
  } else {
    return policy.createScriptURL(value);
  }
}
