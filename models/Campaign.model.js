const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const campaignSchema = new Schema(
  {
    campaign_name: {
      type: String
    },
    campaign_key: {
      type: String
    },
    sent_time: {
      type: String
    },
    campaign_preview: {
        type: String
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Campaign = model("Campaign", campaignSchema);

module.exports = Campaign;
