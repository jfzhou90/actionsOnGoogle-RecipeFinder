const passport = require('passport')

function getUserInfo(data, provider) {
  let fullName;
  let avatar;

  if (provider === 'google') {
    fullName = `${data.give_name} ${data.family_name}`;
    avatar = data.picture;
  } else {
    fullName = data.name;
    avatar = data.picture.data.url;
  }

  return {
    fullName,
    avatar,
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
    console.log('====================================');
    console.log(req.body);
    console.log('====================================');
    const { provider, token } = req.body;
    console.log(provider);
    console.log(token);
    let userInfo;

    try {
      if (provider === 'google') {
        userInfo = await googleAuth(token);
      } else {
        userInfo = await facebookAuth(token);
      }

      const user = await User.findOrCreate(userInfo);

      console.log('====================================');
      console.log(user);
      console.log('====================================');

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
        },
        token: `JWT ${createToken(user)}`,
      });
    } catch (e) {
      return res.status(400).json({ error: true, errorMessage: e.message });
    }
  }
  )
};