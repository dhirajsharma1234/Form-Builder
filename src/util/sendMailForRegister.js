import { transporter } from "../config/email.config.js";

export const sendMailUser = async (user, data, type) => {
  try {
    if (type == "REGISTER") {
      await transporter.sendMail({
        from: process.env.DEMO_MAIL,
        to: user.email,
        subject: "Register",
        text: "click here for verify....",
        html: `
        <h4>Click here for verify.</h4>
        <p>click : <b>${data}</b></p>
        `,
      });
    }
    if (type == "UPDATE_MAIL") {
      await transporter.sendMail({
        from: process.env.DEMO_MAIL,
        to: user.email,
        subject: "Update Email",
        text: "click here for verify....",
        html: `
        <h4>Verify OTP.</h4>
        <p>otp : <b>${data}</b></p>
        `,
      });
    }
    if (type == "CHANGE_PASS") {
      await transporter.sendMail({
        from: "<dhirajsharma20012004@gmail.com>",
        to: user.email,
        subject: "Change Password",
        text: "OTP for change password....",
        html: `
        <h4>Verify OTP.</h4>
        <p>otp : <b>${data}</b></p>
        `,
      });
    }
    return;
  } catch (error) {
    throw new Error(error.message);
  }
};
