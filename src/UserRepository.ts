import { connection, Connection, Schema, Document } from 'mongoose';
import CRUDRepository from './CRUDRepository';
import { User } from 'lexica-dialog-model/dist/User';

const userSchema = new Schema({
  password: {
    required: true,
    type: String,
  },
  uni: {
    index: true,
    required: true,
    type: String,
  },
  username: {
    index: true,
    required: true,
    type: String,
  },
});

userSchema.index({ uni: 1, username: 1 }, { unique: true });

interface UserModel extends User, Document {
  id?: string;
}

class UserRepository extends CRUDRepository<User, UserModel> {

  constructor(mongoConnection: Connection) {
    super(mongoConnection.model<UserModel>('User', userSchema, 'Users'));
  }

  public async findByUsernameAndUni(username: string, uni: string) {
    return this.model.findOne({ username, uni });
  }

}

const userRepository = new UserRepository(connection);
export { UserModel, UserRepository, userRepository };
