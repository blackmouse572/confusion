var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

var config = require("./config.js");
const user = require("./models/user");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
  return jwt.sign(user, config.secretKey, {
    expiresIn: 3600,
  });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.jwtKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);

    User.findOne({ _id: jwt_payload._id })
      .then((user) => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      })
      .catch((err) => done(err, false));
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });
exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    next();
  } else {
    const error = new Error(
      "You are not authorized to perform this operation !"
    );
    error.status = 403;
    return next(error);
  }
};
