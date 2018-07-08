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
    console.log('args.full name is '+ args.fullName)
    console.log(user)
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