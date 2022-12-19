//user model
import User from "../model/user/user.js";
import jwt from "jsonwebtoken";
//config
import message from "../config/message.js";
import status from "../config/status.js";

const generateAuthToken = async (user) => {
  try {
    const genToken = await jwt.sign(
      { _id: user._id, email: user.email, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    return genToken;
  } catch (error) {
    throw new Error(error.message);
  }
};

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Token Not Found.");
    }

    //verify user by token
    const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedData) {
      throw new Error("Authentication Failed.");
    }

    //verify user data
    const user = await User.findOne({ _id: decodedData._id });

    if (!user) {
      throw new Error("Authentication Failed.");
    }

    req.user = user;
    next();
    return;
  } catch (error) {
    return res
      .status(401)
      .json({ status: status.UNAUTHORIZED, message: error.message });
  }
};

export { auth, generateAuthToken };
