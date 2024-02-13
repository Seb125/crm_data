const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const dataSchema = new Schema(
  {
    all: {
      type: Number
    },
    erp: {
      type: Number
    },
    fi: {
      type: Number
    },
    im: {
      type: Number
    },
    anbErp: {
      type: Number
    },
    anbFiIm: {
      type: Number
    },
    berater: {
      type: Number
    },
    beraterErp: {
      type: Number
    },
    beraterFiIm: {
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
