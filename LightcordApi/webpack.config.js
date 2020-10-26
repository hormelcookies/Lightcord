const path = require("path");
const { merge } = require("webpack-merge")
const { SourceMapDevToolPlugin } = require("webpack")
const {
    ESBuildPlugin,
    ESBuildMinifyPlugin
  } = require('esbuild-loader')
const CircularDependencyPlugin = require("circular-dependency-plugin");

let developmentConfig ={
    devtool: "inline-source-map",
    mode: "development",
    output: {
        path: path.resolve(__dirname, "js")
    },
    optimization:{
        minimize: false
    }
}
let productionOutputPath = path.resolve(__dirname, "js")
//let productionOutputPath = path.resolve("..", "DistApp", "LightcordApi", "dist")
let PROJECT_DIR_URL = 'file:///' + productionOutputPath.split(path.sep).join(path.posix.sep)

let productionConfig ={
    devtool: false,
    plugins: [ new SourceMapDevToolPlugin({
        filename: '[name].js.map',
        namespace: 'LightcordApi',
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
    entry: "./src/index.ts",
    target: "electron-renderer",
    output: {
        filename: "main.js",
        library: "LightcordApi",
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
        "uuid/v4": "uuid/v4",
        "powercord/webpack": "powercord/webpack"
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
        alias: {
            "react$": path.resolve(__dirname, "src", "alias", "react.js"),
            "react-dom$": path.resolve(__dirname, "src", "alias", "react-dom.js")
        }
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'esbuild-loader',
                exclude: /node_modules/,
                options:{
                    define:  {
                        'process.env.NODE_ENV': process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
                    },
                    loader: 'tsx',
                    target: 'chrome83',
                    format: 'cjs',
                },
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
            }
      
        ]
    },
    plugins:[
        new ESBuildPlugin(),
        new CircularDependencyPlugin({
            // exclude detection of files based on a RegExp
            exclude: /a\.js|node_modules/,
            // add errors to webpack instead of warnings
            // failOnError: true,
            // set the current working directory for displaying module paths
            cwd: process.cwd(),
        })
    ],
    optimization: {
        minimize:false,
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
