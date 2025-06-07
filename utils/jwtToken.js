const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
	return jwt.sign({ id: payload }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
