const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const cssModuleExceptions = [
    /\.raw\.css$/,
    /[\\/]driver\.js[\\/].*\.css$/
];

/** Extension host bundle (Node.js) */
const extensionConfig = {
    target: 'node',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './src/extension.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2'
    },
    externals: {
        vscode: 'commonjs vscode'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            }
        ]
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'nosources-source-map'
};

/**
 * Shared webview config factory.
 * Both webview bundles need the same loaders to process scratch-gui source.
 */
function createWebviewConfig (name, entryPath) {
    return {
        target: 'web',
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        entry: entryPath,
        output: {
            path: path.resolve(__dirname, 'dist', 'webview'),
            filename: `${name}.js`,
            publicPath: 'auto',
            assetModuleFilename: 'static/assets/[name].[hash][ext][query]'
        },
        resolve: {
            extensions: ['.mjs', '.cjs', '.mjsx', '.cjsx', '.jsx', '.ts', '.tsx', '.js', '.json'],
            // Prefer browser/webpack entry points over node
            mainFields: ['webpack', 'browser', 'module', 'main'],
            conditionNames: ['webpack', 'browser', 'import', 'require', 'default'],
            fallback: {
                Buffer: require.resolve('buffer/'),
                stream: require.resolve('stream-browserify')
            },
            alias: {
                // Ensure scratch packages resolve to monorepo source (webpack entry)
                '@scratch/scratch-gui': path.resolve(__dirname, '../../packages/scratch-gui/src'),
                '@scratch/scratch-vm': path.resolve(__dirname, '../../packages/scratch-vm/src'),
                '@scratch/scratch-render': path.resolve(__dirname, '../../packages/scratch-render/src'),
                '@scratch/scratch-storage': path.resolve(__dirname, '../../packages/scratch-storage/src/index.ts'),
                '@scratch/scratch-svg-renderer': path.resolve(__dirname, '../../packages/scratch-svg-renderer/src')
            }
        },
        module: {
            rules: [
                // JavaScript/JSX via Babel
                {
                    test: /\.[cm]?[jt]sx?$/,
                    loader: 'babel-loader',
                    exclude: {
                        and: [/node_modules/],
                        not: [
                            // Include scratch packages from source
                            /node_modules[\\/]scratch-(paint|render|svg-renderer|vm|blocks|audio|storage)[\\/]src[\\/]/
                        ]
                    },
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-typescript'
                        ]
                    }
                },
                // TypeScript
                {
                    test: /\.[cm]?tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            compilerOptions: {
                                module: 'esnext',
                                target: 'es2020',
                                jsx: 'react',
                                moduleResolution: 'node',
                                esModuleInterop: true,
                                allowJs: true,
                                noEmit: false
                            }
                        }
                    }
                },
                // CSS Modules
                {
                    test: /\.css$/,
                    exclude: cssModuleExceptions,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    namedExport: false,
                                    localIdentName: '[name]_[local]_[hash:base64:5]',
                                    exportLocalsConvention: 'camelCase'
                                },
                                importLoaders: 1,
                                esModule: false
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        'postcss-import',
                                        'postcss-simple-vars',
                                        'autoprefixer'
                                    ]
                                }
                            }
                        }
                    ]
                },
                // Non-CSS-module files
                {
                    test: cssModuleExceptions,
                    use: ['style-loader', 'css-loader', 'postcss-loader']
                },
                // Assets (images, audio, etc.)
                {
                    test: /\.(svg|png|wav|mp3|gif|jpg)$/,
                    resourceQuery: /^$/,
                    type: 'asset'
                },
                // Resource query-based asset handling
                {resourceQuery: '?asset', type: 'asset'},
                {resourceQuery: /^\?(resource|file)$/, type: 'asset/resource'},
                {resourceQuery: /^\?(inline|url)$/, type: 'asset/inline'},
                {resourceQuery: /^\?(source|raw)$/, type: 'asset/source'},
                // ArrayBuffer files
                {
                    resourceQuery: '?arrayBuffer',
                    type: 'javascript/auto',
                    use: 'arraybuffer-loader'
                },
                // Hex files (microbit)
                {
                    test: /\.hex$/,
                    use: [{
                        loader: 'url-loader',
                        options: {limit: 16 * 1024}
                    }]
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.DEBUG': Boolean(process.env.DEBUG),
                'process.env.GA_ID': '"UA-000000-01"',
                'process.env.GTM_ENV_AUTH': '""',
                'process.env.GTM_ID': 'null',
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
            }),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer']
            })
        ],
        devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
        performance: {
            hints: false
        }
    };
}

// Blockflow webview (generator-like editor for .blockflow files)
const blockflowWebviewConfig = createWebviewConfig(
    'blockflow',
    './webview/blockflow/index.jsx'
);

// Scratch webview (full editor for .sb3 files)
const scratchWebviewConfig = createWebviewConfig(
    'scratch',
    './webview/scratch/index.jsx'
);

// Add CopyWebpackPlugin for scratch webview (needs blocks media, workers, static files, and preview HTML)
scratchWebviewConfig.plugins.push(
    new CopyWebpackPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, '../../node_modules/scratch-blocks/media'),
                to: 'static/blocks-media/default',
                noErrorOnMissing: true
            },
            {
                from: path.resolve(__dirname, '../../node_modules/scratch-blocks/media'),
                to: 'static/blocks-media/high-contrast',
                noErrorOnMissing: true
            },
            {
                from: path.resolve(
                    __dirname,
                    '../../packages/scratch-gui/src/lib/settings/color-mode/high-contrast/blocks-media'
                ),
                to: 'static/blocks-media/high-contrast',
                force: true,
                noErrorOnMissing: true
            },
            // Copy static files from scratch-gui (kenny-fish, microbit, etc.)
            {
                from: path.resolve(__dirname, '../../packages/scratch-gui/static'),
                to: 'static',
                noErrorOnMissing: true
            },
            {
                context: path.resolve(__dirname, '../../node_modules/@scratch/scratch-vm/dist/web'),
                from: 'extension-worker.js',
                noErrorOnMissing: true
            },
            {
                context: path.resolve(__dirname, '../../node_modules/@scratch/scratch-storage/dist/web'),
                from: 'chunks/fetch-worker.*.js',
                noErrorOnMissing: true,
                filter: (resourcePath) => !resourcePath.endsWith('.map')
            },
            {
                context: path.resolve(__dirname, '../../node_modules/@scratch/scratch-storage/dist/web'),
                from: 'chunks/vendors-*.js',
                noErrorOnMissing: true,
                filter: (resourcePath) => !resourcePath.endsWith('.map')
            },
            {
                from: path.resolve(__dirname, 'webview/preview/editor.html'),
                to: 'editor.html'
            }
        ]
    })
);

if (!process.env.CI) {
    extensionConfig.plugins = extensionConfig.plugins || [];
    extensionConfig.plugins.push(new webpack.ProgressPlugin());
}

module.exports = [extensionConfig, blockflowWebviewConfig, scratchWebviewConfig];
