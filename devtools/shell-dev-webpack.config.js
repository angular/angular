const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        LATEST_SHA: JSON.stringify(process.env.LATEST_SHA),
      },
    }),
  ],
};
