"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var base_types_1 = require("../base_types");
/**
 * Check if the current or optionally supplied version is compatible with a given version
 */
function versionCompatible(referenceVersion, currentVersion) {
    // Return true if not using a dated version
    if (currentVersion === base_types_1.ApiVersion.Unstable ||
        currentVersion === base_types_1.ApiVersion.Unversioned) {
        return true;
    }
    var numericVersion = function (version) {
        return parseInt(version.replace('-', ''), 10);
    };
    var current = numericVersion(currentVersion);
    var reference = numericVersion(referenceVersion);
    return current >= reference;
}
exports.default = versionCompatible;
