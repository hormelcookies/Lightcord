/**
 *
 * Normalizes platform name to discord api
 * @param {string} platform
 * @returns {string "win" | "osx" | "linux"}
 */
function dapiPlatform(platform) {
    const DISCORD_API_PLATFORMS = ['win', 'osx', 'linux'];

    let p = platform;
    if (p === "darwin" || p === "mac" || p === "macOS" || p === "macos") {
        p = "osx";
    }
    else if (p === "win32") {
        p = "win";
    }
    if (!DISCORD_API_PLATFORMS.includes(p)) {
        throw new Error("Invalid platform: " + p);
    }
    return p;
}
exports.dapiPlatform = dapiPlatform;