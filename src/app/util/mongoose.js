const User = require('../models/User');

const useMongoose = {
  multipleMongooseToObject: function (mongooses) {
    return mongooses.map((mongoose) => mongoose.toObject());
  },
  mongooseToObject: function (mongoose) {
    return mongoose ? mongoose.toObject() : mongoose;
  },
  mongooseSaveModel: async function (model) {
    const result = await model.save();
    return result;
  },
  isDeleted: async (id, type) => {
    switch (type) {
      case 'user':{
        const user = await User.findById({_id: id});
        return user.deleted;
      };
      break;
    
      default:
        break;
    }
      
  },
}
module.exports = useMongoose;
