import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.ObjectId,
      ref: "user",
    },
    form_title: {
      type: String,
      required: true,
    },
    form_data: [
      {
        id: { type: mongoose.ObjectId },
        input_label: {
          type: String,
        },
        input_type: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const FormModel = new mongoose.model("form", formSchema);

export default FormModel;
