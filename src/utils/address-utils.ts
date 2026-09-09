import Address from "../model/addressModel.js";

export const findAddress = async(userId: string, addressId: string): Promise<any> => {
  return await Address.findOne({
    _id: addressId,
    userId,
    isDeleted: false,
  });
}