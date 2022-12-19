//model
import User from "../../model/user/user.js";
import Form from "../../model/form/form.js";
//config
import message from "../../config/message.js";
import status from "../../config/status.js";

class FormData {
  //create the form
  createForm = async (req, res) => {
    try {
      const { title, form_data } = req.body;

      const user_id = req.user._id;

      //check user
      const user = await User.findOne({ _id: user_id });
      if (!user) {
        return res.status(401).json({
          status: status.NOT_ACCEPTABLE,
          message: message.AUTH_FAILED,
        });
      }

      if (!title) {
        return res
          .status(406)
          .json({ status: status.NOT_ACCEPTABLE, message: message.NOT_EMPTY });
      }

      //make an instance of the form
      const form_instance = new Form({
        user_id,
        form_title: title,
        form_data,
      });
      //save
      await form_instance.save();

      return res
        .status(201)
        .json({ status: status.CREATED, message: message.FORM_CREATED });
    } catch (error) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };

  //view the form
  viewForm = async (req, res) => {
    try {
      const { _id } = req.user;

      //check user
      const user = await User.findOne({ _id });
      if (!user) {
        return res.status(401).json({
          status: status.NOT_ACCEPTABLE,
          message: message.AUTH_FAILED,
        });
      }

      const getAllFormOfUser = await Form.find({ user_id: user._id });

      return res
        .status(200)
        .json({ status: status.SUCCESS, data: getAllFormOfUser });
    } catch (error) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };

  //edit the form
  updateForm = async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const { title, form_data } = req.body;

      //check user
      const user = await User.findOne({ _id });
      if (!user) {
        return res.status(401).json({
          status: status.NOT_ACCEPTABLE,
          message: message.AUTH_FAILED,
        });
      }

      //update the form
      const updateForm = await Form.findOneAndUpdate(
        { "form_data._id": id, user_id: user._id },
        {
          $set: {
            form_title: title,
            "form_data.$": form_data,
          },
        },
        { new: true }
      );

      return res
        .status(201)
        .json({ status: status.CREATED, message: message.FORM_UPDATE });
    } catch (error) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };

  deleteForm = async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;

      //check user
      const user = await User.findOne({ _id });
      if (!user) {
        return res.status(401).json({
          status: status.NOT_ACCEPTABLE,
          message: message.AUTH_FAILED,
        });
      }

      //update the form
      await Form.findOneAndDelete({ _id: id, user_id: user._id });

      return res
        .status(200)
        .json({ status: status.SUCCESS, message: message.FORM_DELETE });
    } catch (error) {
      return res
        .status(400)
        .json({ status: status.BAD_REQUEST, message: error.message });
    }
  };
}

const userForm = new FormData();

export default userForm;
