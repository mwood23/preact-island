const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = ({ dev, prod }) => {
  const isDev = dev === true
  const isProd = prod === true

  /** @type { import('webpack').Configuration } */
  const config = {
    mode: isProd ? 'production' : 'development',
    target: 'web',
    resolve: {
      extensions: ['.js', '.json', '.ts', '.tsx'],
      /**
       * From the docs to make Webpack compile Preact:
       * https://preactjs.com/guide/v10/getting-started#aliasing-in-webpack
       */
      alias: {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat', // Must be below test-utils
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },
    devServer: {
      port: 6464,
      hot: false,
    },
    devtool: false,
    entry: {
      'call-to-action': './src/call-to-action.island.tsx',
      'email-subscribe': './src/email-subscribe.island.tsx',
      pokemon: './src/pokemon.island.tsx',
    },
    output: {
      path: path.join(__dirname, 'dist/islands'),
      filename: '[name].island.umd.js',
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [
                  '@babel/preset-typescript',
                  ['@babel/preset-react', { runtime: 'automatic' }],
                  [
                    '@babel/preset-env',
                    { targets: { node: 16 }, modules: false },
                  ],
                ],
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: ['css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/template.html',
        /**
         * Islands are served from /islands in dist so we don't pollute the root domain since these islands are
         * embedded into websites we do not control.
         *
         * In dev mode, we serve islands and the index.html from the root since it's dev mode. For production,
         * the index.html file is served from the root.
         */
        publicPath: isDev ? '/' : '/islands',
        filename: isDev ? 'index.html' : '../index.html',
      }),
    ],
    stats: 'errors-warnings',
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
  }

  return config
}
