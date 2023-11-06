# Pipe precedence in template expressions

Sometimes you want to choose between two values, based on some condition, before passing the choice to the pipe.
You could use the JavaScript ternary operator (`?:`) in the template to make that choice.

Beware! The pipe operator has a higher precedence than the JavaScript ternary operator (`?:`).

If you simply write the expression as if it were evaluated left-to-right, you might be surprised by the result. For example,

```ts
condition ? a : b | pipe
```

is parsed as

```ts
condition ? a : (b | pipe)
```

The value of `b` passes through `pipe`; the value of `a` *will not*.

If you want the pipe to apply to the result of the ternary expression, wrap the entire expression in parentheses. For example,

```ts
(condition ? a : b) | pipe
```

In general, you should always use parentheses to be sure Angular evaluates the expression as you intend.
