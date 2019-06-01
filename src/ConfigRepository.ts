import { Connection, connection, Document, model, Schema } from 'mongoose';
import CRUDRepository from './CRUDRepository';
import { Config } from 'lexica-dialog-model/dist/Config';

interface ConfigModel extends Config, Document {}

const schema = new Schema({
  key: {
    index: true,
    required: true,
    type: String,
  },
  uni: {
    index: true,
    required: true,
    type: String,
  },
  value: Schema.Types.Mixed,
});

schema.index({ uni: 1, key: 1 }, { unique: true });

class ConfigRepository extends CRUDRepository<Config, ConfigModel> {

  constructor(mongoConnection: Connection) {
    super(mongoConnection.model<ConfigModel>('Config', schema, 'Configs'));
  }

  public async findConfigByUniAndKey(uni: string, key: string) {
    return this.model.findOne({ uni, key });
  }

  public async findConfigByKey(key: string) {
    return this.model.find({ key });
  }

  public async findByUni(uni: string) {
    return this.model.find({ uni });
  }

}

export { ConfigModel, ConfigRepository };
export const configRepository = new ConfigRepository(connection);
