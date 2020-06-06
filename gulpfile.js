"use strict";
// gulp 
const gulp = require("gulp");
const fileinclude = require('gulp-file-include');

// needed for Jekyll command
const cp = require("child_process");

// load all of plugins in devDependencies from package.json
const plugin = require('gulp-load-plugins')({
  pattern: ["*"],
  overridePattern: true,
  scope: ["devDependencies"],
  rename: {
    'postcss-easy-import': 'easyImport',
    'postcss-preset-env': 'cssPresentEnv',
    'css-declaration-sorter': 'cssDeclarationSorter'
  }
  
});

const onError = (err) => {
  console.log(err);
};


// BrowserSync
function browserSync(done) {
  plugin.browserSync.init({
    server: {
      baseDir: "./_site/"
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  plugin.browserSync.reload();
  done();
}

// Clean assets
function clean() {
  return plugin.del(["./_site/assets/css"]);
}

// CSS task using PostCSS
function css() {
  var postcssPlugins = [
    // import CSS files using @import
    plugin.easyImport(),
    // PostCSS plugin converts modern CSS to polyfills
    // based on browser support in .browserslistrc 
    plugin.cssPresentEnv({ stage: 1 }),
    // re-order declartions based on property
    plugin.cssDeclarationSorter({
      order: 'concentric-css'
    })
  ]
  return gulp
    .src("./_src/assets/css/style.css")
    .pipe(plugin.postcss(postcssPlugins))
    .pipe(gulp.dest("./_site/assets/css/"))
}

function images() {
  return gulp
    .src('_src/assets/img/*.{jpg,png}')
    .pipe(
      plugin.responsive({
        // Convert all images to JPEG format
        '*': [
          {
            // image-medium.jpg is 375 pixels wide
            width: 375,
            rename: {
              suffix: '-medium',
              extname: '.jpg'
            }
          },
          {
            // image-large.jpg is 480 pixels wide
            width: 480,
            rename: {
              suffix: '-large',
              extname: '.jpg'
            }
          },
          {
            // image-extralarge.jpg is 768 pixels wide
            width: 768,
            rename: {
              suffix: '-extralarge',
              extname: '.jpg'
            }
          }
        ]
      },
      {
        // Global configuration for all images
        // The output quality for JPEG, WebP and TIFF output formats
        quality: 70,
        // Use progressive (interlace) scan for JPEG and PNG output
        progressive: true,
        // Zlib compression level of PNG output format
        compressionLevel: 6,
        // Strip all metadata
        withMetadata: false
      }
      )
    )
    .pipe(gulp.dest('./_site/assets/img'))
}


// Watch files
function watchFiles() {
  gulp.watch("./assets/css/*", css);
  gulp.series(css, browserSyncReload)
  gulp.watch(
    [
      "./_src/*.html",
      "./_src/restuarant.json"

    ],
    gulp.series(css, browserSyncReload)
  );
}

function fileInclude() {
    return gulp
    .src(['_src/index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: './_src'
    }))
    .pipe(gulp.dest('./_site'));
}

// define complex tasks
const build = gulp.series(clean, css, fileInclude );
const watch = gulp.series(clean, css, fileInclude, gulp.parallel(watchFiles, browserSync));

// export tasks

exports.css = css;

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
exports.images = images;