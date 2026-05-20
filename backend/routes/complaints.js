const express = require("express");
const router = express.Router();

const Complaint = require("../models/Complaint");

router.post("/", async (req, res) => {
  try {
    const complaint = new Complaint({
  ...req.body,
  user: req.body.user
});

console.log("Saving complaint:", complaint);

    await complaint.save();

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {

    const complaints = await Complaint.find({
      user: req.params.userId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      complaint: updatedComplaint
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update status"
    });
  }
});

module.exports = router;