var gulp = require("gulp");
var autoprefixer = require("gulp-autoprefixer"); // 前缀
var clean = require("gulp-clean-css"); // 压缩
var concat = require("gulp-concat"); // 合并
var scss = require("gulp-sass"); // 编译scss
var server = require("gulp-webserver") //起服
var htmlmin = require("gulp-htmlmin") //压缩html
var imgmin = require("gulp-imagemin") //压缩图片
var uglify = require("gulp-uglify") //压缩js
var babel = require("gulp-babel") //转码
var rev = require("gulp-rev") //生成后缀
var collector = require("gulp-rev-collector") //替换文件路径
var url = require("url");
var path = require("path")
var fs = require("fs")


//编译
gulp.task("Sass", function() {
    return gulp.src(['./src/scss/*.scss', '!./src/scss/_mixin.scss', '!./src/scss/common.scss'])
        .pipe(scss())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(clean())
        .pipe(gulp.dest('./src/css/'))
})

//起服
gulp.task("server", function() {
        return gulp.src('./src')
            .pipe(server({
                port: 8080,
                open: true,
                livereload: true,
                middleware: function(req, res, next) {
                    var pathname = url.parse(req.url).pathname;
                    console.log(pathname);
                    if (pathname === "/favicon.ico") {
                        return res.end()
                    }
                    pathname = pathname === "/" ? "index.html" : pathname;
                    var filename = path.extname(pathname)
                    if (filename) {
                        var filepath = path.join(__dirname, "src", pathname)
                        if (fs.existsSync(filepath)) {
                            res.end(fs.readFileSync(filepath))
                        }
                    }
                }
            }))
    })
    //压缩js
gulp.task("uglify", function() {
    return gulp.src('./src/js/*.js')
        .pipe(babel({
            presets: "es2015"
        }))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('./build/js/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev'))
})

//拷贝css
gulp.task("copycss", function() {
        return gulp.src('./src/css/*.css')
            .pipe(gulp.dest('./build/css/'))
    })
    //拷贝 font
gulp.task("minfont", function() {
    return gulp.src('./src/font/*.*')
        .pipe(gulp.dest('./build/font/'))
})

//压缩html
gulp.task('minhtml', function() {
    return gulp.src(['./rev/*.json', './src/index.html'])
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(collector({
            replaceReved: true
        }))
        .pipe(gulp.dest('./build/'))
})

//压缩图片
gulp.task("minimg", function() {
    return gulp.src('./src/img/*.{jpg,png,gif}')
        .pipe(imgmin({
            optimizationLevel: 5
        }))
        .pipe(gulp.dest('./build/img/'))
})




//监听
gulp.task("watch", function() {
    return gulp.watch('./src/scss/*.scss', gulp.series("Sass"))
})


gulp.task("build", gulp.parallel("uglify", "copycss", "minhtml", "minfont", "minimg"))
gulp.task("dev", gulp.series("Sass", "server", "watch"))