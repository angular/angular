# compile closure test source file
$(npm bin)/tsc -p .
# Run the Google Closure compiler java runnable with zone externs
java -jar node_modules/google-closure-compiler/compiler.jar --flagfile 'scripts/closure/closure_flagfile' --externs 'lib/closure/zone_externs.js'

# the names of Zone exposed API should be kept correctly with zone externs, test program should exit with 0.
node build/closure/closure-bundle.js

if [ $? -eq 0 ]
then
  echo "Successfully pass closure compiler with zone externs"
else
  echo "failed to pass closure compiler with zone externs"
  exit 1
fi

# Run the Google Closure compiler java runnable without zone externs.
java -jar node_modules/google-closure-compiler/compiler.jar --flagfile 'scripts/closure/closure_flagfile'

# the names of Zone exposed API should be renamed and fail to be executed, test program should exit with 1.
node build/closure/closure-bundle.js

if [ $? -eq 1 ]
then
  echo "Successfully detect closure compiler error without zone externs"
else
  echo "failed to detect closure compiler error without zone externs"
  exit 1
fi

exit 0
