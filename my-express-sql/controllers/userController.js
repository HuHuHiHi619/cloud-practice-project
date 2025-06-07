const {
  createUser,
  findByEmail,
  findALL,
} = require("../services/userServices");
const { verifyPassword } = require("../utils/hash");

const register = async (req, res) => {
  const data = req.body;
  try {
    console.log("🟡 Registering user:", data);
    const { name, email, password } = req.body;
    if (!name || !password || !email) {
      return res
        .status(400)
        .json({ error: "Require name or password or email" });
    }

    await createUser(name, email, password);
    return res.status(200).json({
      message: "Register successful !",
    });
  } catch (error) {
    console.error("Failed to rigister:", error);
    return res.status(500).json({ error: "Registeration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await verifyPassword(user.password, password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid creadentials" });
    }

    req.session.user = {
        id: user.id ,
        name : user.name
    }
    console.log("Login successful!",req.session.user)

    return res.status(200).json({
      message: "Login successful !",
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Failed to login:", error);
    return res.status(500).json({ error: "Login failed" });
  }
};

const logout = async (req , res) => {
    try{
        req.session.destroy((error) => {
            if(error){
                return res.status(500).json({error : 'Logout failde'})
            }
        })
        res.clearCookie('sessionId')
        console.log('logout successfully')
        return res.status(200).json({message : 'Logout successfully'})
    } catch(error) {
        console.error('Failed to logout:',error)
        return res.status(500).json({error : 'Logout failed'})
    }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await findALL();
    if (!users) {
      return res.status(401).json({ error: "Cannot find any user" });
    }
    console.log(users);
    return res.status(201).json({
      message: "Get all users successful",
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
      })),
    });
  } catch (error) {
    console.error("Failed to get all users:", error);
    return res.status(500).json({ error: "Failed to get user" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getAllUsers,
};
