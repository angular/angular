KARMA_TEST_TARGETS=`yarn bazel query --output=label 'attr("tags", "karma_test", //packages/...) except attr("tags", "view-engine-only", //packages/...)'`
yarn bazel build $KARMA_TEST_TARGETS;
yarn bazel build //packages/core/test:downleveled_es5_fixture
yarn bazel build //packages/zone.js:npm_package
yarn karma start ./karma-js.conf.js --single-run;