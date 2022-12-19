import bcryptjs from "bcryptjs";

export const hashPass = async (pass) => {
  try {
    const hashPass = await bcryptjs.hash(pass, 12);
    return hashPass;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const compPass = async (pass, user) => {
  try {
    const comp = await bcryptjs.compare(pass, user.password);
    return comp;
  } catch (error) {
    throw new Error(error.message);
  }
};
