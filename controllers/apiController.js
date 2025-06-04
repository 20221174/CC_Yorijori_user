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
    const auth = User.authenticate();

    auth(email, password, (err, user, options) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // 👇 Passport 세션에 유저 저장 → serializeUser 호출됨
      req.login(user, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Login failed" });
        }

        const {
          password: pw,
          mysalt,
          ...userWithoutPassword
        } = user.dataValues;
        return res.json(userWithoutPassword);
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
