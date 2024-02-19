const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const detailSchema = new Schema(
  {
    count_sent: {
      type: Number
    },
    count_delivered: {
      type: Number
    },
    percent_delivered: {
      type: Number
    },
    percent_open: {
      type: Number
    },
    unique_clicked_percent: {
      type: Number
    },
    clicksperopenrate: {
      type: Number
    }

  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Detail = model("Detail", detailSchema);

module.exports = Detail;
