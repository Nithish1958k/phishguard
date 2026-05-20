const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: {
  type: String,
  required: true
},

reporterName: {
  type: String,
  default: ""
},

complaintId: {
  type: String,
  unique: true,
  required: true
},

    type: {
      type: String,
      required: true
    },

    desc: {
      type: String,
      required: true
    },

    details: {
      type: String,
      default: ""
    },

    scamUrl: {
      type: String,
      default: ""
    },

    upiId: {
      type: String,
      default: ""
    },

    phoneNumber: {
      type: String,
      default: ""
    },

    evidence: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Pending", "Investigating", "Resolved", "Rejected"],
      default: "Pending"
    },

    priority: {
      type: String,
      default: "High"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);