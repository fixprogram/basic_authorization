const User = require("./models/User");
const Role = require("./models/Role");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const generateAccessToken = (id, roles) => {
  const payload = { id, roles };

  return jwt.sign(payload, process.env.SECRET, { expiresIn: "24h" });
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: `There was an error during registration: ${[errors]}`,
        });
      }
      const { username, password } = req.body;
      const candidate = await User.findOne({ username });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "User with such username already exists" });
      }
      const hashPassword = bcryptjs.hashSync(password, 7);
      const userRole = await Role.findOne({ value: "USER" });
      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value],
      });
      await user.save();
      return res.json({ message: "User was successfuly saved" });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: `Registration error: ${e}` });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: `User ${user} is not found` });
      }
      const isPasswordValid = bcryptjs.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: `The password is incorrect` });
      }
      const token = generateAccessToken(user._id, user.roles);
      return res.json({ token });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: `Login error: ${e}` });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: `Error during loading users: ${e}` });
    }
  }
}

module.exports = new authController();
