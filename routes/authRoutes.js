const passport = require('passport')

module.exports = app => {
  app.post('/auth/google/', passport.authenticate('google-token'),
    function (req, res) {
      console.log(req)
      res.send(req.user);
    }
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/surveys');
    }
  );

  app.get('/api/current_user', (req, res) => {
    res.send(req.user)
  })

  app.get('/api/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });


}

