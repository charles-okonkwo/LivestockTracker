const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    await db.read();
    const { username, email, password, role, fullName } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Get next ID
    db.data._meta.lastUserId += 1;
    const id = db.data._meta.lastUserId;
    
    const user = {
      id,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      fullName,
      createdAt: new Date().toISOString()
    };
    
    db.data.users.push(user);
    await db.write();
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async findById(id) {
    await db.read();
    const user = db.data.users.find(u => u.id === id);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  static async findByEmail(email) {
    await db.read();
    return db.data.users.find(u => u.email === email.toLowerCase().trim()) || null;
  }

  static async findByUsername(username) {
    await db.read();
    return db.data.users.find(u => u.username === username.toLowerCase().trim()) || null;
  }

  static async findOne(query) {
    if (query.email) {
      return await this.findByEmail(query.email);
    }
    if (query.username) {
      return await this.findByUsername(query.username);
    }
    if (query.$or) {
      for (const condition of query.$or) {
        if (condition.email) {
          const user = await this.findByEmail(condition.email);
          if (user) return user;
        }
        if (condition.username) {
          const user = await this.findByUsername(condition.username);
          if (user) return user;
        }
      }
    }
    return null;
  }

  static async comparePassword(user, candidatePassword) {
    return await bcrypt.compare(candidatePassword, user.password);
  }
}

module.exports = User;
