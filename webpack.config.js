const path = require('path')
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    context: __dirname,
    target: "webworker",
    entry: path.resolve(__dirname, "./index.js"),
    plugins: [
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "./crypto")
        })
    ]
}