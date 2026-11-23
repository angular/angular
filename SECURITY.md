Angular is part of Google [Open Source Software Vulnerability Reward Program](https://bughunters.google.com/about/rules/6521337925468160/google-open-source-software-vulnerability-reward-program-rules). For vulnerabilities in Angular, please submit your report [here](https://bughunters.google.com/report).

For more information, check out [Angular's security policy](https://angular.dev/best-practices/security).

## Policies

The following defines some team policies around what does and does not constitute a security vulnerability in the Angular framework.

- **Prototype pollution is itself a DoS vulnerability.**
  - An attacker could pollute any symbol into the wrong type and cause an error, nothing we can do will prevent that.
  - Therefore we don't care about any DoS vulnerability which relies on prototype pollution as a precondition.
- **We trust the user's source code.**
  - "A malicious repository can execute untrusted code" is not a viable attack vector.
  - Language service does not run in restricted mode, has minimal risk of a malicious repository compromising a user.
  - We assume it is always unsafe to run an untrusted repository outside of a sandbox.
- **DoS attacks which break only the attacker's client are not security issues.**
  - Exception: DoS attacks which break other users may be security issues.
  - Exception: DoS attacks which waste server resources significantly beyond the cost of the attacker's request may be security issues.
- **Memory leaks are considered general bugs, not DOS vulnerabilities.**
  - While any memory leak is technically a DOS vulnerability in SSR, these are generally low enough impact to not be considered security issues.
- **Our public API contract is defined by our TS types, any issue which requires breaking those types (ex. via a cast to `any`) falls outside Angular's support.**
  - Ex. It may be possible to leak user state by attaching it to some global data structure in SSR, but we do not consider this to be a valid vulnerability if you have to escape TS types to do it.
- **JIT compiler is removed and not supported in production.**
  - Exploits which require the JIT compiler on the page are not vulnerabilities.
- **Circumventing router guards/safety checks in CSR or SSR is not a security vulnerability.**
  - Attackers can trivially circumvent these guards in CSR via dev tooling.
  - Developers should not rely upon these guards in SSR either, they are purely convenience.
- **Circumventing form validity checks is not a security vulnerability.**
  - Attackers can trivially circumvent these checks via dev tooling.

## Invariants

The following are invariants about Angular's technical infrastructure which limit some potential attack vectors. These statements are asserted by humans, not proven in any formal means. However, any security report should assume them to be true unless and until it can conclusively prove them to be false in an attack. If one of these statements invalidates a security report, that report bears the burden of conclusively demonstrating the statement to be false in its reproduction.

- **Zones don't leak across SSR requests (except for the root).**
  - Every request gets its own Zone, so data stored on the Zone is unique to that user, no intrinsic risk of leaking user data from one request to an attacker's request.
- **Injectors are not shared between applications.**
  - SSR always creates a new ApplicationRef and root services, no intrinsic risk of leaking user data from one request to an attacker's request.
  - Exception: Module-scoped data is shared and is a potential vector for data leakage.
- **`ngDevMode` / `ngServerMode` are set at compile time** in production deployments and cannot be manipulated by attackers.

## Prioritization Guide

Angular (specifically the framework) is not a product, and almost no vulnerability is an exploit in and of itself, given there is nothing to compromise. Angular can only be exploited through a real deployment of a specific application. The vast majority of potential issues do not affect the default `ng new` app, and require additional steps of varying use/misuse of the framework before introducing a vulnerability on that real application. This goes beyond just an attacker finding the right sequence of characters to cause an exploit, and requires a well-intentioned developer to make a legitimate mistake introducing the vulnerability in the first place. Therefore we need to examine prioritization through the lens of how likely a developer is to make that mistake and the severity of what happens when they do.

- **High:** A vulnerability impacts ~all users of a major feature in common usage such as SSR, hydration, templating, or routing (ex. SSRF via a malicious `Host` header affects all SSR + `HttpClient` users, which is a fairly common use case).
- **Medium:** A vulnerability impacts users interacting with public APIs in their reasonable usage.
- **Low:** A vulnerability impacts users interacting with public APIs misused in an unintended or unreasonable way (ex. vulnerability from unsanitized user input polluting the `APP_ID` value, which should never be user writable).
- **None:** A vulnerability impacts users of private APIs or explicitly unsupported use cases.

Experimental / developer preview APIs _are not_ exempted from these priorities. While we make no hard guarantees about these APIs publicly, a vulnerability in such features should be raised to our attention and addressed before reaching stability.

_Exception:_ angular.dev, Angular DevTools, and the Angular VSCode Extension _are_ products with concrete deployments and can be exploited in their current states. Vulnerabilities should be evaluated against the real deployments of these products.
