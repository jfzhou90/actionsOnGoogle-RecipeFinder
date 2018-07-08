const passport = require('passport')
const GoogleTokenStrategy = require('passport-google-token').Strategy
const mongoose = require('mongoose')
const keys = require('../config/keys')

const User = mongoose.model('users')

passport.serializeUser((user, done) => {
  done(null, user)
})

// passport.deserializeUser((id, done) => {
//   console.log(id)
//   done(null, id)
// })

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(new GoogleTokenStrategy({
  clientID: keys.googleClientID,
  clientSecret: keys.googleClientSecret
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile)
  // User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //   return done(err, user);
  // });
}
));