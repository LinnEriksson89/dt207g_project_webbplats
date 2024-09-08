/* DT207G - Backend-baserad webbutveckling
 * Projekt
 * Linn Eriksson, VT24
 */

//Variables to include in NPM-packades.
const {src, dest, watch, series, parallel} = require("gulp");
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify-es').default;

//Paths
const files = {
    sassPath: "src/css/**/*.scss",
    imagePath: "src/images/*",
    ejsPath: "src/views/*.ejs",
    partialsPath: "src/views/partials/*ejs",
    jsPath: "src/js/**/*.js"
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

//partials task
function partialsTask() {
    return src(files.partialsPath)
    .pipe(dest("views/partials"))
}


//JS-task
function jsTask() {
    return src(files.jsPath)
    .pipe(uglify())
    .pipe(dest('public/js'));
}

//Watcher
function watchTask() {

    browserSync.init({
        server: "/"
    });

    watch([files.sassPath, files.imagePath, files.ejsPath, files.partialsPath, files.jsPath],
    parallel(sassTask, imageTask, ejsTask, partialsTask, jsTask))
    .on('change', browserSync.reload);
}

//Run all tasks above
exports.default = series(
    parallel(sassTask, imageTask, ejsTask, partialsTask, jsTask),
    watchTask
);