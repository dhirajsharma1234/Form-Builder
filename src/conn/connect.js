import mongoose from "mongoose";

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => {
//     console.log("Connection Successfull...........");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
const connecting = async () => {
  try {
    mongoose.set("strictQuery", false);
    const con = await mongoose.connect(process.env.MONGO_URL);

    if (con) {
      console.log("Database connect successfully.......");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

connecting();

export default connecting;
