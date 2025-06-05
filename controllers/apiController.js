const db = require("../models"),
  User = db.user,
  Sequelize = require("sequelize"),
  sequelize = db.sequelize,
  Op = Sequelize.Op;

const bcrypt = require("bcrypt");

exports.getUserByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const users = await User.findAll({
      // 이거 나중에 findOne으로 바꾸든지 해야 할 듯
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
