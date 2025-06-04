const db = require("../models"),
  User = db.user,
  Sequelize = require("sequelize"),
  sequelize = db.sequelize,
  Op = Sequelize.Op;

exports.getUserByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const users = await User.findAll({
      where: {
        userId: {
          [Op.like]: `%${userId}%`,
        },
      },
    });
    res.json(users);
  } catch (error) {
    console.error("사용자 조회 실패:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
