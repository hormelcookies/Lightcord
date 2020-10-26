const path = require("path");
const { merge } = require("webpack-merge")
const { SourceMapDevToolPlugin } = require("webpack")
const {
    ESBuildPlugin,
    ESBuildMinifyPlugin
  } = require('esbuild-loader')
  
//const CircularDependencyPlugin = require("circular-dependency-plugin");

let developmentConfig ={
    devtool: "inline-source-map",
    mode: "development",
    output: {
        path: path.resolve(__dirname,"js")
    },
    optimization:{
        minimize: false
    }
}
let productionOutputPath = path.resolve("..", "DistApp", "DiscordJS", "dist")
let PROJECT_DIR_URL = 'file:///' + productionOutputPath.split(path.sep).join(path.posix.sep)

let productionConfig ={
    devtool: false,
    plugins: [ new SourceMapDevToolPlugin({
        filename: 'index.js.map',
        namespace: 'DiscordJS',
        append: "\n//# sourceMappingURL=" + PROJECT_DIR_URL + "/[url]",

    })],
    mode: "production",
    output: {
        path: productionOutputPath
    },
    optimization:{
        minimize: true
    }
}

let config = {
    target: "electron-renderer",
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "js"),
        library: "DiscordJS",
        libraryTarget: "commonjs2"
    },
    externals: {
        electron: `electron`,
        fs: `fs`,
        path: `path`,
        events: `events`,
        rimraf: `rimraf`,
        yauzl: `yauzl`,
        mkdirp: `mkdirp`,
        request: `request`,
        "node-fetch": "node-fetch",
        "uuid/v1": "uuid/v1",
        "uuid/v4": "uuid/v4"
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: "esbuild-loader",
            exclude: /node_modules/,
            options:{
                loader: 'js',
                target: 'chrome83',
                format: 'cjs'
            }
        },
        {
            test: /\.ts$/,
            loader: 'esbuild-loader',
            exclude: /node_modules/,
            options:{
                loader: 'ts',
                target: 'chrome83',
                format: 'cjs'
            }
        }]
    },
    plugins:[
        new ESBuildPlugin()
    ],
    optimization: {
        minimizer: [
          new ESBuildMinifyPlugin({
            target: 'chrome83',
            sourcemap: true,
            format: 'cjs'
          })
        ],
      },
};

if (process.env.NODE_ENV === "production") {
    module.exports = merge(config, productionConfig);
  } else {
    module.exports = merge(config, developmentConfig);
}
