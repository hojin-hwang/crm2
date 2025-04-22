module.exports = {
  entry: "./public/component/test/main.js",
  output: {
    path: __dirname + '/public/dist',
    filename: "build.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};