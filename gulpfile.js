var gulp = require('gulp'),
	less = require('gulp-less'),
	browserSync = require('browser-sync'),
	babel = require('gulp-babel'),
    rename = require("gulp-rename");

gulp.task('less', function(){ // Создаем таск "less"
    return gulp.src('src/less/main.less') // Берем источник
        .pipe(less()) // Преобразуем Less в CSS посредством gulp-less
        .pipe(gulp.dest('dist/css')) // Выгружаем результата в папку
        .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('babel', function () {
    return gulp.src('src/js/main.es6.js')
        .pipe(babel())
        .pipe(rename('main.es5.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: '' // Директория для сервера
        },
        notify: false // Отключаем уведомления
    });
});


gulp.task('watch', ['less', 'babel', 'browser-sync'], function() {
	gulp.watch('src/less/main.less', ['less']);
	gulp.watch('src/js/main.es6.js', ['babel']);
	gulp.watch('*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
});