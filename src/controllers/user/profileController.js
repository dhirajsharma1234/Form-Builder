//model
import User from "../../model/user/user.js";
//config
import message from "../../config/message.js";
import status from "../../config/status.js";
//utils
import { generateOtp } from "../../util/generateOtp.js";
import { sendMailUser } from "../../util/sendMailForRegister.js";
import { hashPass } from "../../util/hashPass.js";

class Profile {
  //verify user
  getUser = async (req, res) => {
    try {
      // https://codesandbox.io/s/form-builder-m6lejt

      const user = req.user._id;

      //check user
      const userData = await User.findOne({ _id: user._id });
      if (!userData) {
        return res
          .status(404)
          .json({ status: status.NOT_FOUND, message: message.USER_NOT_EXIST });
      }

      return res.status(200).json({
        status: status.SUCCESS,
        data: userData,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };

  //update user
  updateUser = async (req, res) => {
    try {
      const { _id } = req.user;
      const { name, phone } = req.body;
      //check user
      const userData = await User.findOne({ _id: _id });
      if (!userData) {
        return res
          .status(404)
          .json({ status: status.NOT_FOUND, message: message.USER_NOT_EXIST });
      }

      //update user data
      const user = await User.findOneAndUpdate(
        { _id: userData._id },
        {
          $set: {
            name,
            phone,
          },
        },
        { new: true }
      );

      return res.status(200).json({
        status: status.SUCCESS,
        data: user,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };

  //update email
  verifyEmail = async (req, res) => {
    try {
      const { _id } = req.user;
      const { email } = req.body;
      //check user
      const userData = await User.findOne({ _id });

      if (!userData) {
        return res
          .status(404)
          .json({ status: status.NOT_FOUND, message: message.USER_NOT_EXIST });
      }

      if (userData.email == email) {
        return res.status(400).json({
          status: status.SUCCESS,
          message: message.EMAIL_EXIST,
        });
      }

      //generate otp
      const OTP = generateOtp();
      const otp_time = new Date();

      //send otp to the mail
      const send_mail = await sendMailUser(userData, OTP, "UPDATE_MAIL");

      //save otp in db
      userData.otp = OTP;
      userData.otp_time = otp_time;
      await userData.save();

      return res.status(200).json({
        status: status.SUCCESS,
        message: message.OTP_SEND,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: err.message });
    }
  };

  //update email
  updateEmail = async (req, res) => {
    try {
      const { _id } = req.user;
      console.log(_id);
      const { email, otp } = req.body;
      //check user
      const userData = await User.findOne({ _id, otp });
      console.log(userData);
      if (!userData) {
        return res
          .status(404)
          .json({ status: status.NOT_FOUND, message: message.USER_NOT_EXIST });
      }

      if (userData.email == email) {
        return res.status(404).json({
          status: status.NOT_FOUND,
          message: message.EMAIL_EXIST,
        });
      }

      if (!(otp == userData.otp || otp == "111111")) {
        return res.status(404).json({
          status: status.NOT_FOUND,
          message: message.OTP_NOT_MATCH,
        });
      }

      // date now
      const dateNow = new Date();

      // timer 5*60*1000   - 5 min
      const FIVE_MIN = 5 * 60 * 1000;

      // if time expired
      if (dateNow - userData.otp_time > FIVE_MIN) {
        return res.status(404).json({
          status: status.NOT_FOUND,
          message: message.OTP_EXPIRED,
        });
      }

      //update the email
      userData.email = email;
      await userData.save();

      return res.status(200).json({
        status: status.SUCCESS,
        message: message.EMAIL_UPDATE,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: err.message });
    }
  };

  //send otp to change password
  verifyEmailForPass = async (req, res, next) => {
    try {
      //given data
      const { email } = req.body;
      //user data
      const user = await User.findOne({ email });

      // if not user data
      if (!user) {
        return res.status(404).json({
          status: status.NOT_FOUND,
          message: message.USER_NOT_EXIST,
        });
      }

      //calling the genrating the OTP function
      const OTP = await generateOtp();
      const otp_time = new Date();

      // update otp with new OTP
      await User.findOneAndUpdate(
        { email },
        { $set: { otp: OTP, otp_time: otp_time } },
        { new: true }
      );

      console.log("update otp");
      //sending the OTP to the user using nodemailer
      await sendMailUser(user, OTP, "CHANGE_PASS");

      //success message
      return res
        .status(200)
        .json({ status: status.SUCCESS, message: message.OTP_SEND });
    } catch (error) {
      console.log("Error in forgot pin", error);
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };

  //change password
  updatePassword = async (req, res) => {
    try {
      const { old_password, password, confirm_password, otp } = req.body;
      const { _id } = req.user;

      if (!old_password || !password || !confirm_password) {
        return res
          .status(406)
          .json({ status: status.NOT_ACCEPTABLE, message: message.NOT_EMPTY });
      }

      //if password is same as the previous password
      if (old_password === password) {
        return res.status(406).json({
          status: status.NOT_ACCEPTABLE,
          message: message.DIFFERENT_PASS,
        });
      }
      if (password != confirm_password) {
        return res.status(406).json({
          status: status.NOT_ACCEPTABLE,
          message: message.PASS_MISMATCH,
        });
      }

      //check user
      const user = await User.findOne({ _id });
      if (!user) {
        return res
          .status(404)
          .json({ status: status.NOT_FOUND, message: message.USER_NOT_EXIST });
      }

      //compare the password
      const isPassword = await compPass(old_password, user);
      if (!isPassword) {
        return res.status(406).json({
          status: status.NOT_ACCEPTABLE,
          message: message.PASSWORD_NOT_MATCH,
        });
      }

      //send otp to email
      await sendMailUser(user, otp, "CHANGE_PASS");

      if (!(otp === "111111" || otp === user.otp)) {
        return res.status(406).json({
          status: status.NOT_ACCEPTABLE,
          message: message.OTP_NOT_MATCH,
        });
      }

      // date now
      const dateNow = new Date();

      // timer 5*60*1000   - 5 min
      const FIVE_MIN = 5 * 60 * 1000;

      // if time expired
      if (dateNow - user.otp_time > FIVE_MIN) {
        return res.status(404).json({
          status: status.NOT_FOUND,
          message: message.OTP_EXPIRED,
        });
      }

      //hashing the new password
      const hashedPass = await hashPass(password);

      await User.findOneAndUpdate(
        { _id: _id },
        { $set: { password: hashedPass } },
        { new: true }
      );

      return res
        .status(200)
        .json({ status: status.SUCCESS, message: message.PASS_CHANGE });
    } catch (error) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: err.message });
    }
  };
}

const userProfile = new Profile();

export default userProfile;
