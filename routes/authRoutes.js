const passport = require('passport');
const axios = require('axios');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const createToken = args =>
  jwt.sign({ id: args._id }, keys.JWT_Secret);

function getUserInfo(data, provider) {
  let fullName;
  let avatar;

  if (provider === 'google') {
    fullName = `${data.given_name} ${data.family_name}`;
    avatar = data.picture;
    googleId = data.id;
  } 

  return {
    fullName,
    avatar,
    googleId,
    email: data.email,
    providerData: {
      uid: data.id,
      provider,
    },
  };
}

async function googleAuth(token) {
  try {
    const { data } = await axios.get('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return getUserInfo(data, 'google');
  } catch (e) {
    return e;
  }
}

module.exports = app => {
  app.post('/api/auth/google', async (req, res) => {
    const { provider, token } = req.body;

    try {
      let userInfo = await googleAuth(token);

      // console.log(userInfo)
      const user = await User.findOrCreate(userInfo);

      console.log('====================================');
      console.log(user);
      console.log('====================================');

      return res.status(200).send({success: true,user: {id: user._id,name: user.name},token: `JWT ${createToken(user)}`,});
    } catch (e) {
      console.log(e)
      return res.status(400).json({ error: true, errorMessage: e.message });
    }
  }
  )
};