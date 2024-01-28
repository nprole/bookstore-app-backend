import {forwardRef, Inject, Injectable, NotFoundException,} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {User} from '../schema/user.schema';
import {randomString} from '../../../shared/utils/random-string';
import {ObjectId} from "../../../shared/mongoose/object-id";

@Injectable()
export class UserService {
  private blockedFields: (keyof User)[] = [
    'password',
    'sessionToken',
    'email'
  ];

  unpopulatedFields = '-' + this.blockedFields.join(' -');

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
  }

  getUserByName(name: string) {
    const username = { $regex: new RegExp(`^${name}$`, 'i') };

    return this.userModel.findOne({ username });
  }

  async validateUserByName(username: string) {
    const user = await this.getUserByName(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  getUserByEmail(mail: string) {
    const email = { $regex: new RegExp(`^${mail}$`, 'i') };

    return this.userModel.findOne({ email });
  }

  async validateUserByEmail(email: string) {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  getUserBy(filter: FilterQuery<User>) {
    return this.userModel.findOne(filter);
  }

  getUserByGoogleId(id: string) {
    return this.userModel.findOne({ googleId: id });
  }

  getUserById(id: ObjectId | string) {
    return this.userModel.findById(id);
  }

  async validateUserById(id: string) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }



  async generateUsername(base: string) {
    const name = base.replace(/\s/g, '');

    if (!(await this.getUserByName(name))) {
      return name;
    }

    return this.generateUsername(name + randomString(1));
  }

  async getUser(username: string) {
    return (
      (await this.getUserByName(username)) ??
      (await this.getUserByEmail(username))
    );
  }

  filterUser(user: User, allowedFields: (keyof User)[] = []) {
    const userObject = user.toObject({ virtuals: true });

    for (const field of this.blockedFields) {
      if (allowedFields.includes(field)) {
        continue;
      }

      delete userObject[field];
    }

    return userObject;
  }

  async create(body: Partial<User>) {
    const user = await this.userModel.create(body);

   // user.generateSessionToken();

    return user.save();
  }
}
