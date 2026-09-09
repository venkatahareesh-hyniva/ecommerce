import User from "../model/userModel.js";

export const getProfileService = async (userId: any) => {
  const user = await User.findById(userId)
    .select("-password -__v -tokenVersion")
    .lean();

  if (!user) {
    return null;
  }
  if (user.role !== "dealer") {
    delete user.rejectionReason;
  }

  return user;
};

export const updateProfileService = async (userId: any, profileData: any) => {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  const { firstName, middleName, lastName, phoneNumber, address } = profileData;

  if (firstName !== undefined) {
    user.firstName = firstName;
  }

  if (middleName !== undefined) {
    user.middleName = middleName;
  }

  if (lastName !== undefined) {
    user.lastName = lastName;
  }

  if (phoneNumber !== undefined) {
    user.phoneNumber = phoneNumber;
  }

  if (address !== undefined) {
    user.address = address;
  }

  await user.save();

  const userData = await User.findById(userId)
    .select("-password -__v -tokenVersion")
    .lean();
  if (!user) {
    return null;
  }
  if (user.role !== "dealer") {
    delete user.rejectionReason;
  }

  return userData;
};

export const getUserByPhoneOrEmailService = (
  phoneNumber: string,
  email: string,
): any => {
  return User.findOne({ $or: [{ email }, { phoneNumber }] });
};

export const getUserByEmail = async (email: string): Promise<any> => {
  return await User.findOne({ email });
};
