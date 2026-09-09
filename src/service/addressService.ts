import Address from "../model/addressModel.js";
import User from "../model/userModel.js";
import { findAddress } from "../utils/address-utils.js";

class AddressService {
  async createAddress(userId: string, addressData: any): Promise<any> {
    // const { addressLine1, addressLine2, city, state, pincode, country } =
    //   addressData;

    const address = await Address.create({
      userId,
      ...addressData,
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        addresses: address._id,
      },
    });

    const { userId: _, isDeleted: __, ...newAddress } = address.toObject();

    return newAddress;
  }

  async updateAddress(
    userId: any,
    addressId: string,
    addressData: any,
  ): Promise<any> {
    // const { addressLine1, addressLine2, city, state, pincode, country } =
    //   addressData;

    const updatedAddress = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId,
        isDeleted: false,
      },
      { ...addressData },
      {
        new: true,
        runValidators: true,
      },
    ).select("-__v -userId -isDeleted");

    return updatedAddress;
  }

  async getAddresses(userId: string): Promise<any> {
    const addresses = await Address.find({
      userId,
      isDeleted: false,
    }).select("-__v -userId -isDeleted");
    return addresses;
  }

  async getAddressById(userId: string, addressId: string): Promise<any> {
    const address = await findAddress(userId, addressId);
    if (!address) {
      return null;
    }
  const {userId: _userId,isDeleted: _isDeleted,__v,...addressData} = address.toObject();

  return addressData;
  }
  

  async deleteAddress(userId: string, addressId: string): Promise<any> {
    const address = await findAddress(userId, addressId);

    if (!address) {
      return null;
    }

    address.isDeleted = true;
    await address.save();

    await User.findByIdAndUpdate(userId, {
      $pull: {
        addresses: address._id,
      },
    });

    return address;
  }
}

export default new AddressService();
