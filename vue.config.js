module.exports = {
    publicPath:
        process.env.NODE_ENV === 'production'
            ? '/Z-S-Overview-Customizer/'
            : '/',
    css: {
        loaderOptions: {
            scss: {
                additionalData: `
                        @import "@/assets/scss/functions.scss";
                        @import "@/assets/scss/mixins.scss";
                        @import "@/assets/scss/vars.scss";
                    `,
            },
        },
    },
    pages: {
        index: {
            // entry for the page
            entry: 'src/main.ts',
            // the source template
            template: 'public/index.html',
            // output as dist/index.html
            filename: 'index.html',
            // when using title option,
            // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'Z-S Overview Customizer',
            // chunks to include on this page, by default includes
            // extracted common chunks and vendor chunks.
            // chunks: ['chunk-vendors', 'chunk-common', 'index'],
        },
        // when using the entry-only string format,
        // template is inferred to be `public/subpage.html`
        // and falls back to `public/index.html` if not found.
        // Output filename is inferred to be `subpage.html`.
        // subpage: 'src/subpage/main.js'
    },
    configureWebpack: {
        devtool: 'source-map',
    },
    devServer: {
        overlay: {
            warnings: true,
            errors: true,
        },
    },
};
