const jwt = require("jsonwebtoken")
const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const authenticate = require("../middleware/authenticate")


require("../db/conn");
const User = require("../model/userSchema");


router.get("/", (req, res) => {
  console.log("hello router");
  res.send(`HomePage`);
});

//using promises
// router.post("/register",  (req, res) => {

//     const { name, email, phone, address, password, cpassword } = req.body;

//   if (!name || !email || !phone || !address || !password || !cpassword) {
//     return res.status(422).json({ error: "Plz filled the field" });
//   }

//   User.findOne({ email: email })
//     .then((userExists) => {
//       if (userExists) {
//         return res.status(422).json({ error: "email already register" });
//       }

//       const user = new User({
//         name,
//         email,
//         phone,
//         address,
//         password,
//         cpassword,
//       });
//       user.save().then(() => {
//         res
//           .status(201)
//           .json({ message: "user adta added" })
//           .catch((err) =>
//             res.status(500).json({ error: "registarion failed" })
//           );
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

//Using asyns await, Register as Trasporter
router.post("/registerTransporter", async (req, res) => {
  const { name, email, phone, address, password, cpassword } = req.body;

  if (!name || !email || !phone || !address || !password || !cpassword) {
    return res.status(422).json({ error: "Plz filled the field" });
  }

  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "email already register" });
    }else if (password != cpassword){
      return res.status(422).json({ error: "Password and confirm passwrod should be same" });
    }else{
      const user = new User({
        name,email,phone,address,password,cpassword,
      });
    

    
     await user.save();

    res.status(201).json({ message: "user data added" });
    }
  } catch (err) {
    console.log(err);
  }
});


//REgister as Manufacturer
router.post("/registerManufacturer", async (req, res) => {
  const { name, email, phone, address, password, cpassword } = req.body;

  if (!name || !email || !phone || !address || !password || !cpassword) {
    return res.status(422).json({ error: "Please fill in all the fields" });
  }

  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "Email is already registered" });
    } else if (password !== cpassword) {
      return res.status(422).json({ error: "Password and confirm password should match" });
    } else {
      const user = new User({
        name,
        email,
        phone,
        address,
        password,
        cpassword,
        // Add any supplier-specific fields here//z
      });

      await user.save();

      res.status(201).json({ message: "User data added" });
    }
  } catch (err) {
    console.log(err);
  }
});


//login route for transporter

router.post("/loginTransporter",async(req,res)=>{
try{
  let token;
  const { email, password} = req.body;
  if(!email || !password){
    return res.status(400).json({error:"Plz filled correct details"})
  }

const userLogin  = await User.findOne({email:email});

//console.log(userLogin);

if (userLogin){
  const isMatch = await bcrypt.compare(password, userLogin.password);

   token = await userLogin.generateAuthToken();
    console.log(token);

    res.cookie("jwtoken", token,{
      expires:new Date(Date.now() + 2589200000),
      httpOnly:true
    });

  if(!isMatch){
    res.status(400).json({error:"Invalid Credentials"});
  }else
  
  
  res.json({message:"user logged in"});
}else {
  res.status(400).json({error:"Invalid Credentials"});
}


  
} catch(err){
  console.log(err);
}
})

// Manufacturer Login Route
router.post("/loginManufacturer", async (req, res) => {
  const { email, password } = req.body;

  try {
    const manufacturer = await Manufacturer.findOne({ email });
    if (!manufacturer) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, manufacturer.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = await manufacturer.generateAuthToken();

    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 2589200000),
      httpOnly: true
    });

    res.json({ message: "Manufacturer logged in" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/getAllUsers", async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
});




//user page

router.get("/userpage",authenticate , (req, res) => {
  res.send(req.rootUser);
});

//get user data for home page
router.get("/getdata",authenticate,(req,res)=>{
  console.log(`Hello home`);
  res.send(req.rootUser)
})


router.get("/logout",(req,res)=>{
  console.log(`Hello logout`);
  res.clearCookie("jwtoken", {path:"/"})
  res.status(200).send(`User Logout`);
})


module.exports = router;
