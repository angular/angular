# API Examples

This folder contains small example apps that get in-lined into our API docs.
Each example contains tests for application behavior (as opposed to testing Angular's
behavior) just like an Angular application developer would write.

# Running the examples

```
./build.sh                            # run only when framework code changes 
./modules/@angular/examples/build.sh  # run when test change
$(npm bin)/gulp serve-examples        # start server
```

navigate to [http://localhost:8001](http://localhost:8001)

# Running the tests

```
./build.sh                            # run only when framework code changes 
./modules/@angular/examples/test.sh   # run to compile tests and run them
```

NOTE: sometimes the http server does not exits properly and it retans the `8001` port.
 in Such a case you can use `lsof -i:8001` to see which process it is and then use `kill` 
 to remove it. (Or in single command: `lsof -i:8001 -t | xargs kill`)