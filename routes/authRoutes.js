const passport = require('passport')

module.exports = app => {
  // app.post('api/auth/google/', passport.authenticate('google-token'),
  //   function (req, res) {
  //     console.log('test')
  //     res.send(req.user);
  //   }
  // );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/surveys');
    }
  );

  app.post('/api/auth/google', (req, res) => {
    console.log(req)
    res.send(req)
  })

  app.get('/api/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });


}

