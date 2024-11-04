// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  // Add webpack 5 polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "events": require.resolve("events/"),
    "buffer": require.resolve("buffer/"),
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util/"),
    "crypto": require.resolve("crypto-browserify")
  };

  return config;
};