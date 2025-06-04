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

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // passport-local-sequelize에서 제공하는 authenticate() 메서드 사용
    const auth = User.authenticate(); // authenticate() 호출 → 함수 반환

    auth(email, password, (err, user, options) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // 비밀번호, salt 등 민감 정보 제외하고 응답
      const { password: pw, mysalt, ...userWithoutPassword } = user.dataValues;
      return res.json(userWithoutPassword);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
