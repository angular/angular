# API Examples

This folder contains small example apps that get in-lined into our API docs.
Each example contains tests for application behavior (as opposed to testing Angular's
behavior) just like an Angular application developer would write.

# Running the examples

```
# # execute the following command only when framework code changes
./build.sh

# run when test change
./packages/examples/build.sh  

# start server
$(npm bin)/gulp serve-examples
```

navigate to [http://localhost:8001](http://localhost:8001)

# Running the tests

```
 # run only when framework code changes
./build.sh

# run to compile tests and run them
./packages/examples/test.sh
```

NOTE: sometimes the http server does not exit properly and it retains the `8001` port.
 in such a case you can use `lsof -i:8001` to see which process it is and then use `kill` 
 to remove it. (Or in single command: `lsof -i:8001 -t | xargs kill`)