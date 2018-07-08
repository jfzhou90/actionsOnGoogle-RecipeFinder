const passport = require('passport')
const mongoose = require('mongoose')
const keys = require('../config/keys')
const User = mongoose.model('users')
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt

const jwtOpts = {
  // Tell passport to take the jwt token from the Authorization headers
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.JWT_Secret,
};

const jwtStrategy = new JWTStrategy(jwtOpts, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    console.log(payload.id)
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (e) {
    return done(e, false);
  }
});

passport.use(jwtStrategy);

const requireJwtAuth = passport.authenticate('jwt', { session: false });