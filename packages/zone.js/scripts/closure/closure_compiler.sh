# compile closure test source file
$(npm bin)/tsc -p .
# Run the Google Closure compiler java runnable with zone externs
java -jar ./node_modules/google-closure-compiler-java/compiler.jar --flagfile './scripts/closure/closure_flagfile' --externs './build/zone_externs.js' --externs './node_modules/@externs/nodejs/v8/global.js' --process_common_js_modules

# the names of Zone exposed API should be kept correctly with zone externs, test program should exit with 0.
node build/closure/zone-closure-bundle.js

if [ $? -eq 0 ]
then
  echo "Successfully pass closure compiler with zone externs"
else
  echo "failed to pass closure compiler with zone externs"
  exit 1
fi

# Run the Google Closure compiler java runnable without zone externs.
java -jar node_modules/google-closure-compiler-java/compiler.jar --flagfile 'scripts/closure/closure_flagfile' --externs './node_modules/@externs/nodejs/v8/global.js' --process_common_js_modules

node build/closure/zone-closure-bundle.js

if [ $? -eq 1 ]
then
  echo "Successfully detect closure compiler error without zone externs"
else
  echo "failed to detect closure compiler error without zone externs"
  exit 1
fi

exit 0
