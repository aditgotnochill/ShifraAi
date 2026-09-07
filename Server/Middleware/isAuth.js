import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "user does not have token" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res
        .status(401)
        .json({ message: "user does not have a valid token" });
    }
    req.userId = verifyToken.id;
    next();
  } catch (error) {
    return res.status(500).json({ message: `isAuth Error ${error}` });
  }
};
