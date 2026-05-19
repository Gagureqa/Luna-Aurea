// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Моковая база данных (в реальном проекте используйте MongoDB/PostgreSQL)
const users = [];

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаём пользователя
    const user = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    // Создаём JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Токен действует 7 дней
    );

    // Не отправляем пароль в ответе
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: userWithoutPassword,
      message: 'Registration successful',
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Находим пользователя
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Определяем время жизни токена
    const expiresIn = rememberMe ? '30d' : '1d'; // 30 дней или 1 день

    // Создаём JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Не отправляем пароль в ответе
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Валидация токена
router.post('/validate', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем, существует ли пользователь
    const user = users.find(u => u.id === decoded.userId);
    
    if (user) {
      res.json({ valid: true });
    } else {
      res.status(401).json({ valid: false });
    }

  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

// Выход (инвалидация токена)
router.post('/logout', (req, res) => {
  // В реальном проекте добавьте токен в чёрный список
  // или используйте Redis для хранения невалидных токенов
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;