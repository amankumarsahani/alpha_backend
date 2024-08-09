const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { username, email, password, companyName } = req.body;
  try {
    // Check if user already exists
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length > 0) return res.status(400).json({ message: 'User already exists' });

    // Check if company exists, if not create new company
    const [company] = await db.query('SELECT * FROM companies WHERE CompanyName = ?', [companyName]);
    let companyID;
    if (company.length > 0) {
      companyID = company[0].CompanyID;
    } else {
      const [newCompany] = await db.query('INSERT INTO companies (CompanyName) VALUES (?)', [companyName]);
      companyID = newCompany.insertId;
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (CompanyID, Username, Email, PasswordHash) VALUES (?, ?, ?, ?)', [companyID, username, email, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user[0].PasswordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userID: user[0].UserID, companyID: user[0].CompanyID }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser };
