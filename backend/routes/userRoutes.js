const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const Project = require("../models/Project");
const User = require("../models/User");

const router = express.Router();

router.get("/dashboard/stats", protect, async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalLikes: { $sum: "$likes" },
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    const data = stats[0] || { totalProjects: 0, totalLikes: 0, totalViews: 0 };
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get("/users", protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
});

router.delete("/users/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Safety check: Don't allow deleting admins
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete an administrator account." });
    }

    await user.deleteOne();
    // Also delete user's projects
    await Project.deleteMany({ user: req.params.id });
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    return next(error);
  }
});

router.get("/public/count", async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    return res.status(200).json({ success: true, count });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
