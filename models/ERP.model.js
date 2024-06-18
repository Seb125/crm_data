const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const erpSchema = new Schema(
  {
    pagePath_screenPageViews: {
      type: [
        {
          pagePath: String,
          pageViews: Number,
          activeUsers: Number,
          bounceRate: Number

        },
      ],
      default: [],
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);



const ERP = model("ERP", erpSchema);

module.exports = ERP;
