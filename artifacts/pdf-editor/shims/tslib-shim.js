// Shim that makes tslib work as both a named-export CJS module AND exposes
// a `.default` property so pdf-lib's ESM import (`import tslib from ...`)
// resolves correctly under Metro's Hermes bundler.
"use strict";
const tslib = require("tslib");
// Mark as an ES module so Babel's interopRequireDefault returns `exports.default`
exports.__esModule = true;
exports.default = tslib;
// Re-export every helper as a named export too
Object.keys(tslib).forEach(function (key) {
  if (key !== "default" && key !== "__esModule") {
    exports[key] = tslib[key];
  }
});
