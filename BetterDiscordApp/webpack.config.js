const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { merge } = require("webpack-merge")
const { SourceMapDevToolPlugin } = require("webpack")
const {
  ESBuildPlugin,
  ESBuildMinifyPlugin
} = require('esbuild-loader')
  
let developmentConfig ={
  devtool: "inline-source-map",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist")
  },
  optimization:{
    minimize: false
  }
}
//let productionOutputPath = path.resolve(__dirname, "dist")
let productionOutputPath = path.resolve("..", "DistApp", "BetterDiscordApp", "dist")
let PROJECT_DIR_URL = 'file:///' + productionOutputPath.split(path.sep).join(path.posix.sep)

let productionConfig ={
    devtool: false,
    plugins: [ new SourceMapDevToolPlugin({
        filename: 'index.js.map',
        namespace: 'BetterDiscordApp',
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
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    library: "BetterDiscord",
    libraryTarget: "umd"
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
    "node-fetch": "node-fetch"
  },
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [
      path.resolve("src", "builtins"),
      path.resolve("src", "modules")
    ],
    alias: {
      react$: path.resolve(__dirname, "src", "react.js"),
      "react-dom$": path.resolve(__dirname, "src", "react-dom.js")
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "esbuild-loader",
        exclude: /node_modules/,
        options:{
          loader: 'jsx',
          target: 'chrome83',
          format: 'cjs'
        }
      }
    ]
  },
  plugins: [
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
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'chrome83',
        sourcemap: true,
        format: 'cjs'
      })
    ]
  }
};

if (process.env.NODE_ENV === "production") {
  module.exports = merge(config, productionConfig);
} else {
  module.exports = merge(config, developmentConfig);
}
