const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers["authorization"];

    if (!authorizationHeader) {
      return res
        .status(401)
        .send({ message: "Authorization header missing", success: false });
    }

    const parts = authorizationHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .send({ message: "Token format invalid (e.g., must be 'Bearer <token>')", success: false });
    }
    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        console.error("JWT Verification Error:", err.name, err.message);
        return res
          .status(401)
          .send({ message: "Token is not valid", success: false, error: err.message });
      } else {
        // --- THE FIX IS HERE ---
        // Instead of req.body.userId, use req.user or req.auth
        req.user = { id: decode.id }; // Assuming decode.id exists and is the user's ID
        // If your token also includes role:
        // req.user = { id: decode.id, role: decode.role };

        next();
      }
    });
  } catch (error) {
    console.error("Middleware General Error:", error);
    return res.status(500).send({ message: "Internal server error in auth middleware", success: false, error: error.message });
  }
};