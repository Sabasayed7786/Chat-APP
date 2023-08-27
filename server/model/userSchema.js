const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  // role: {
  //   type: String,
  //   required: true,
  //   validate: {
  //     validator: function (value) {
  //       return value === 'transporter' || value === 'manufacturer';
  //     },
  //     message: 'Role must be either "transporter" or "manufacturer"',
  //   },
  // },

  phone: {
    type: Number,
  },

  address: {
    type: String,
    reuqired: true,
  },

  password: {
    type: String,
    required: true,
  },

  cpassword: {
    type: String,
    required: true,
  },
  tokens:[
    {
      token:{
        type: String,
        required:true
      }
    }
  ]
})


//password hashing
userSchema.pre("save",async function(next){
if(this.isModified('password')){
this.password = await bcrypt.hash(this.password, 12);
this.cpassword = await bcrypt.hash(this.cpassword, 12);
}
next();
});

//we are generating token
userSchema.methods.generateAuthToken = async function(){
try{
let token = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
this.tokens = this.tokens.concat({token:token});
await this.save();
return token;
}catch(err){
  console.log(err);
}
}

const User = mongoose.model('USER', userSchema);

module.exports = User;
