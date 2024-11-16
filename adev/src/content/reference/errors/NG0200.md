# Circular Dependency in DI

<docs-video src="https://www.youtube.com/embed/CpLOm4o_FzM"/>

A cyclic dependency exists when a [dependency of a service](guide/di/hierarchical-dependency-injection) directly or indirectly depends on the service itself. For example, if `UserService` depends on `EmployeeService`, which also depends on `UserService`. Angular will have to instantiate `EmployeeService` to create `UserService`, which depends on `UserService`, itself.

## Debugging the error

Use the call stack to determine where the cyclical dependency exists.
You will be able to see if any child dependencies rely on the original file by [mapping out](guide/di/di-in-action) the component, module, or service's dependencies, and identifying the loop causing the problem.

Break this loop \(or circle\) of dependency to resolve this error. This most commonly means removing or refactoring the dependencies to not be reliant on one another.
