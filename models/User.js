const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: String,
  name: String
});

userSchema.statics.findOrCreate = async function (args) {
  try {
    const user = await this.findOne({
      googleId: args.id,
    });
    if (!user) {
      return await this.create({googleId: args.id, name: args.fullName});
    }
    console.log(user)
    return user;
  } catch (e) {
    return e;
  }
};

mongoose.model('users', userSchema);