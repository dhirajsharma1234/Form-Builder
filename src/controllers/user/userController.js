import crypto from "crypto";
//model
import User from "../../model/user/user.js";
//auth
import { generateAuthToken } from "../../auth/auth.js";
//config
import message from "../../config/message.js";
import status from "../../config/status.js";
//util
import { hashPass, compPass } from "../../util/hashPass.js";
import { sendMailUser } from "../../util/sendMailForRegister.js";

class Users {
  register = async (req, res) => {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      if (!name || !email || !phone || !password) {
        return res
          .status(406)
          .json({ status: status.NOT_ACCEPTABLE, message: message.NOT_EMPTY });
      }

      if (password != confirmPassword) {
        return res.status(406).json({
          status: status.NOT_ACCEPTABLE,
          message: message.PASSWORD_NOT_MATCH,
        });
      }

      const emailExist = await User.findOne({ email });

      if (emailExist) {
        return res
          .status(406)
          .json({ status: status.NOT_ACCEPTABLE, message: message.USER_EXIST });
      }

      //hash the password
      const hash = await hashPass(password);

      //save user to db
      const userInstance = new User({
        name,
        email,
        phone,
        password: hash,
      });

      const user = await userInstance.save();

      // generate auth token
      const token = await generateAuthToken(user);

      //generate link/token for verify
      user.token = crypto.randomBytes(30).toString("hex");
      //1 min 1000 milli sec 5 min 1000*60 = 1min  1000*60*5 = 5min
      user.tokenExpires = Date.now() + 300000;
      await user.save();

      //generate link
      const generateLink = `http://localhost:9000/api/user/register/${user.token}`;

      //send Mail to user
      const send_mail = await sendMailUser(
        userInstance,
        generateLink,
        "REGISTER"
      );

      return res.status(200).json({
        status: status.SUCCESS,
        message: message.VERIFY_LINK,
        token,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };

  //verify user
  verifyEmail = async (req, res) => {
    try {
      // https://codesandbox.io/s/form-builder-m6lejt
      const { token } = req.params;

      // //check user exist or not
      const user = await User.findOne({
        token,
        tokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: message.USER_NOT_EXIST,
        });
      }

      if (user.verified) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: message.USER_NOT_EXIST,
        });
      }

      //verified
      await User.findOneAndUpdate(
        { _id: user._id },
        { 
          $set: { verified: true }, 
          $unset: {
            token: "",
            tokenExpires: "",
          }, 
        },
      );

      return res.status(200).json({
        status: status.SUCCESS,
        message: message.USER_VERIFIED,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: err.message });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(406)
          .json({ status: status.NOT_ACCEPTABLE, message: message.NOT_EMPTY });
      }

      //check email and password
      const checkUser = await User.findOne({ email });

      if (!checkUser) {
        return res.status(406).json({
          status: status.NOT_ACCEPTABLE,
          message: message.USER_NOT_EXIST,
        });
      }

      //check password
      const comp = await compPass(password, checkUser);

      if (!comp || !checkUser.verified) {
        return res
          .status(400)
          .json({ status: status.BAD_REQUEST, message: message.LOGIN_FAILED });
      }

      //create jwt token
      const createToken = await generateAuthToken(checkUser);

      return res.status(200).json({
        status: status.SUCCESS,
        message: message.LOGIN_SUCCESS,
        token: createToken,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };
}

const userObj = new Users();

export default userObj;
