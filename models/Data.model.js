const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const dataSchema = new Schema(
  {
    erp: {
      type: Number
    },
    fi: {
      type: Number
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Data = model("Data", dataSchema);

module.exports = Data;
