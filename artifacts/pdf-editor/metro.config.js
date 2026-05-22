const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const tslibShim = path.resolve(__dirname, "./shims/tslib-shim.js");

// Intercept pdf-lib's internal relative tslib import and redirect to our shim
// that properly exposes `default` for ESM->CJS interop on Metro/Hermes.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isPdfLib =
    context.originModulePath &&
    context.originModulePath.includes("pdf-lib");

  if (isPdfLib && (moduleName === "../tslib.js" || moduleName === "tslib")) {
    return { filePath: tslibShim, type: "sourceFile" };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
