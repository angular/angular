# Practical observable usage

Here are some examples of domains in which observables are particularly useful.

## Type-ahead suggestions

Observables can simplify the implementation of type-ahead suggestions. Typically, a type-ahead has to do a series of separate tasks:

* Listen for data from an input.
* Trim the value (remove whitespace) and make sure it’s a minimum length.
* Debounce (so as not to send off API requests for every keystroke, but instead wait for a break in keystrokes).
* Don’t send a request if the value stays the same (rapidly hit a character, then backspace, for instance).
* Cancel ongoing AJAX requests if their results will be invalidated by the updated results.

Writing this in full JavaScript can be quite involved. With observables, you can use a simple series of RxJS operators:

<code-example path="practical-observable-usage/src/typeahead.ts" header="Typeahead"></code-example>

## Exponential backoff

Exponential backoff is a technique in which you retry an API after failure, making the time in between retries longer after each consecutive failure, with a maximum number of retries after which the request is considered to have failed. This can be quite complex to implement with promises and other methods of tracking AJAX calls. With observables, it is very easy:

<code-example path="practical-observable-usage/src/backoff.ts" header="Exponential backoff"></code-example>
