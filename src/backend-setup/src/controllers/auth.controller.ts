import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { query, run, get } from '../database/connection';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendLoginNotification } from '../utils/notification.helper';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Get user from database — allow login by username OR student_id
    let user: any = null;

    // Try username match first
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length > 0) {
      user = users[0];
    } else {
      // Try student_id lookup and resolve to user
      const studs = await query('SELECT user_id FROM students WHERE student_id = ?', [username]);
      if (studs.length > 0 && studs[0].user_id) {
        const userRows = await query('SELECT * FROM users WHERE id = ?', [studs[0].user_id]);
        if (userRows.length > 0) user = userRows[0];
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const secret: Secret = (process.env.JWT_SECRET || 'secret') as Secret;
    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn']
    };

    const token = jwt.sign(payload, secret, signOptions);

    // Log activity
    await run(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'LOGIN', `User ${username} logged in`]
    );

    // Send login notification for students
    if (user.role === 'student') {
      await sendLoginNotification(user.id);
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    let { username, password, email, role = 'student', student } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Hash password first
    const hashedPassword = await bcrypt.hash(password, 10);

    // If role is student, we'll generate a unique username if not provided
    let finalUsername = username || null;
    let finalStudentId = null;

    if (role === 'student' && student && typeof student === 'object') {
      const {
        student_id,
        first_name,
        middle_name,
        last_name,
        suffix,
        student_type,
        course,
        year_level,
        contact_number,
        address,
        birth_date,
        gender
      } = student as any;

      // Auto-generate student_id when not provided in format YYYY-xxxx (4 digits)
      finalStudentId = student_id || null;
      if (!finalStudentId) {
        const year = new Date().getFullYear();
        const prefix = String(year);
        try {
          const rows = await query('SELECT student_id FROM students WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1', [`${prefix}-%`]);
          if (rows.length > 0 && rows[0].student_id) {
            const last = rows[0].student_id as string;
            const parts = last.split('-');
            const lastNum = parseInt(parts[1] || '0', 10) || 0;
            const next = lastNum + 1;
            finalStudentId = `${prefix}-${String(next).padStart(4, '0')}`;
          } else {
            finalStudentId = `${prefix}-0001`;
          }
        } catch (e) {
          // Fallback to timestamp-based id on error
          const fallbackNum = Math.floor(Math.random() * 9000) + 1000;
          finalStudentId = `${prefix}-${String(fallbackNum).padStart(4, '0')}`;
        }
      }

      // Generate unique username if not provided
      if (!finalUsername) {
        // Use student_id with a random suffix to ensure uniqueness
        const randomSuffix = Math.floor(Math.random() * 1000);
        finalUsername = `${finalStudentId}-${randomSuffix}`;
        
        // Check if this username exists and regenerate if needed
        let attempts = 0;
        while (attempts < 5) {
          const existingUsers = await query(
            'SELECT id FROM users WHERE username = ?',
            [finalUsername]
          );
          if (existingUsers.length === 0) break;
          
          const newSuffix = Math.floor(Math.random() * 1000);
          finalUsername = `${finalStudentId}-${newSuffix}`;
          attempts++;
        }
      } else {
        // Check if provided username already exists
        const existingUsers = await query(
          'SELECT id FROM users WHERE username = ?',
          [finalUsername]
        );
        if (existingUsers.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Username already exists'
          });
        }
      }
    } else {
      // For non-student roles, username is required
      if (!finalUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is required'
        });
      }

      // Check if user already exists
      const existingUsers = await query(
        'SELECT id FROM users WHERE username = ?',
        [finalUsername]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // Insert user
    const result = await run(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [finalUsername, hashedPassword, email, role]
    );

    const userId = result.lastInsertRowid;

    // If role is student and student details provided, create student record and link
    if (role === 'student' && student && typeof student === 'object') {
      const {
        first_name,
        middle_name,
        last_name,
        suffix,
        student_type,
        course,
        year_level,
        contact_number,
        address,
        birth_date,
        gender
      } = student as any;

      await run(
        `INSERT INTO students (
          user_id, student_id, first_name, middle_name, last_name, suffix,
          student_type, course, year_level, contact_number, address, birth_date, gender, status, cor_status, clearance_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', 'Pending')`,
        [userId, finalStudentId, first_name || null, middle_name || null, last_name || null, suffix || null,
          student_type ? (student_type.charAt(0).toUpperCase() + student_type.slice(1).toLowerCase()) : 'New', course || null, year_level || null, contact_number || null, address || null, birth_date || null, gender || null]
      );
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: result.lastInsertRowid,
        username: finalUsername,
        role
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    
    // Handle specific database constraint errors
    if (error.message && error.message.includes('UNIQUE constraint failed: users.username')) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    if (error.message && error.message.includes('UNIQUE constraint failed: students.student_id')) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error: ' + (error.message || 'Unknown error')
    });
  }
};

export const getNextStudentId = async (req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear();
    const prefix = String(year);
    let finalStudentId = null;

    try {
      const rows = await query('SELECT student_id FROM students WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1', [`${prefix}-%`]);
      if (rows.length > 0 && rows[0].student_id) {
        const last = rows[0].student_id as string;
        const parts = last.split('-');
        const lastNum = parseInt(parts[1] || '0', 10) || 0;
        const next = lastNum + 1;
        finalStudentId = `${prefix}-${String(next).padStart(4, '0')}`;
      } else {
        finalStudentId = `${prefix}-0001`;
      }
    } catch (e) {
      const fallbackNum = Math.floor(Math.random() * 9000) + 1000;
      finalStudentId = `${prefix}-${String(fallbackNum).padStart(4, '0')}`;
    }

    res.json({ success: true, data: { student_id: finalStudentId } });
  } catch (error) {
    console.error('Get next student id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const users = await query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If student, get student details
    if (req.user?.role === 'student') {
      const students = await query(
        'SELECT * FROM students WHERE user_id = ?',
        [userId]
      );

      return res.json({
        success: true,
        data: {
          user: users[0],
          student: students[0] || null
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
