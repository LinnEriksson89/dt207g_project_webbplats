/* DT207G - Backend-baserad webbutveckling
 * Projekt
 * Linn Eriksson, VT24
 */

//Variables to include in NPM-packades.
const {src, dest, watch, series, parallel} = require("gulp");
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const ejs = require("gulp-ejs");

//Paths
const files = {
    sassPath: "src/css/**/*.scss",
    imagePath: "src/images/*",
    ejsPath: "src/views/*.ejs"
}

//SASS-task
function sassTask() {
    return src(files.sassPath)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on("error", sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest("public/css"))
    .pipe(browserSync.stream());
}

//Image-task
function imageTask() {
    return src(files.imagePath)
    .pipe(dest('public/images'));
}

//ejs-task
function ejsTask() {
    return src(files.ejsPath)
    .pipe(dest("views"))
}

//Watcher
function watchTask() {

    browserSync.init({
        server: "/"
    });

    watch([files.sassPath, files.imagePath, files.ejsPath],
    parallel(sassTask, imageTask, ejsTask))
    .on('change', browserSync.reload);
}

//Run all tasks above
exports.default = series(
    parallel(sassTask, imageTask, ejsTask),
    watchTask
);