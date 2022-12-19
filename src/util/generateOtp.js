export const generateOtp = () => {
  const char = "abcdefghijklmnopqrstuvwxyz";
  let otp = "";

  for (let i = 0; i < 3; i++) {
    otp += Math.floor(10 * Math.random());
    otp += char[Math.floor(char.length * Math.random())];
  }
  return otp;
};
