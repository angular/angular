/// <reference types="trusted-types" />

let policy: Pick<TrustedTypePolicy, 'name'|'createURL'>;

/**
* Turns the value to trusted HTML. If the application uses Trusted Types the
* value is transformed into TrustedHTML, which can be assigned to execution
* sink. If the application doesn't use Trusted Types, the return value is the
* same as the argument.
*/
export function dangerouslyTurnToTrusteURL(value: string): string|TrustedURL {
  if (!policy && TrustedTypes !== undefined) {
    policy = TrustedTypes.createPolicy('dom-adapter-href', {createURL: (s: string) => s});
  }

  if (!policy) {
    return value;
  } else {
    return policy.createURL(value);
  }
}
