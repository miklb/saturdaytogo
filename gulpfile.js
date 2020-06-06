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
const build = gulp.series(clean, css, fileInclude);
const watch = gulp.series(clean, css, fileInclude, gulp.parallel(watchFiles, browserSync));

// export tasks

exports.css = css;

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;