//test25
const express = require("express"),
  app = express();
(layouts = require("express-ejs-layouts")),
  (db = require("./models/index")),
  (bodyParser = require("body-parser")),
  (session = require("express-session")),
  (flash = require("connect-flash")),
  (passport = require("passport")),
  (fs = require("fs")),
  (FileStore = require("session-file-store")(session));

db.sequelize.sync({});
const User = db.user;

(multer = require("multer")),
  (multerGoogleStorage = require("multer-google-storage")),
  (cors = require("cors"));

// Redis 관련 모듈 추가
const Redis = require("redis");
const { RedisStore } = require("connect-redis");

// Redis 클라이언트 생성
const redisClient = Redis.createClient({
  legacyMode: true, // Redis v4를 사용하는 경우, connect-redis 호환을 위해 legacy 모드 설정
  url: "redis://redis:6379", // 실제 Redis 서버 컨테이너와 일치해야 됨
});
redisClient.connect().catch(console.error);

// cors 오류 방지 설정
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

//bodyParser 추가
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//파일 업로드를 위한 multer 설정
const upload = multer({
  storage: multerGoogleStorage.storageEngine({
    bucket: "yorizori_post_img",
    projectId: "burnished-core-422015-g1",
    keyFilename: "secure/burnished-core-422015-g1-f3b170868aa8.json",
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한 (예: 5MB)
});

//프로필 이미지 업로드를 위한 multer 설정
const path = require("path");

const uploadprofile = require("./config/multerProfileConfig");

// `uploadprofile` 디렉토리가 존재하지 않으면 생성합니다.
const uploadDir = path.join(__dirname, "uploadprofile");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 정적 파일 제공 설정
app.use(
  "/uploadprofile",
  express.static(path.join(__dirname, "uploadprofile"))
);

// 뷰 엔진 설정
app.set("view engine", "ejs");
app.use(layouts);
app.use(express.static("public")); // 정적 파일 사용

app.use(flash());

// 세션 설정 (RedisStore 사용)
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "yorijori_secret_key",
    resave: false,
    saveUninitialized: false, // true면 로그인 안해도 세션 생성됨
    cookie: {
      secure: false, // HTTPS 환경에서는 true로 설정 필요
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1일
    },
  })
);

//플래시 메시지 미들웨어 설정
app.use(flash());

// 전역 변수 설정 (플래시 메시지를 모든 템플릿에서 사용할 수 있도록 설정)
app.use((req, res, next) => {
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
  next();
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser((user, done) => {
  // 원하는 정보 저장 (예: userId)
  done(null, user.userId); // 또는 user.id 등
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ where: { userId: id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  console.log(res.locals.flashMessages);
  next();
});

// 모든 요청 전에 실행되는 미들웨어
app.use((req, res, next) => {
  res.locals.showCategoryBar = false; // 기본적으로 카테고리 바를 표시하지 않음
  res.locals.showSubCategoryBar = false; // 기본적으로 세부 카테고리 바를 표시하지 않음
  next();
});

// Router
const homeRouter = require("./routers/homeRouter.js");
const authRouter = require("./routers/authRouter");
const apiRouter = require("./routers/apiRouter.js");

// home 접근
app.use("/", homeRouter);
// 로그인 및 사용자 관리 접근
app.use("/auth", authRouter);
// api
app.use("/user-api", apiRouter);

// Express 전역 변수를 설정하여 모든 EJS 템플릿에서 접근 가능하도록 함
app.locals.domainName = process.env.DOMAIN_NAME;

// 서버 실행
app.set("port", 3000);
app.listen(app.get("port"), "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});

module.exports = app;
