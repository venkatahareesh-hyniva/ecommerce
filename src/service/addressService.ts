import Address from "../model/addressModel.js";
import User from "../model/userModel.js";

class AddressService {
  async createAddress(userId: any, addressData: any): Promise<any> {
    const { addressLine1, addressLine2, city, state, pincode, country } =
      addressData;

    const address = await Address.create({
      userId,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
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
    const { addressLine1, addressLine2, city, state, pincode, country } =
      addressData;

    const updatedAddress = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId,
        isDeleted: false,
      },
      {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-__v -userId -isDeleted");

    return updatedAddress;
  }

  async getAddresses(userId: any): Promise<any> {
    const addresses = await Address.find({
      userId,
      isDeleted: false,
    }).select("-__v -userId -isDeleted");

    return addresses;
  }

  async getAddressById(userId: any, addressId: string): Promise<any> {
    const address = await Address.findOne({
      _id: addressId,
      userId,
      isDeleted: false,
    }).select("-__v");

    return address;
  }

  async deleteAddress(userId: any, addressId: string): Promise<any> {
    const deletedAddress = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
      {
        new: true,
      },
    ).select("-__v -userId -isDeleted");

    return deletedAddress;
  }
}

export default new AddressService();
