import db, { query, get } from './connection';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function addSampleStudents() {
  try {
    // Hash the default password
    const hashedPassword = await bcrypt.hash('student123', 10);
    
    // Create student users
    const studentUsers = [
      ['juan.delacruz', hashedPassword, 'student', 'juan.delacruz@student.informatics.edu'],
      ['maria.santos', hashedPassword, 'student', 'maria.santos@student.informatics.edu'],
      ['pedro.reyes', hashedPassword, 'student', 'pedro.reyes@student.informatics.edu'],
      ['ana.garcia', hashedPassword, 'student', 'ana.garcia@student.informatics.edu'],
      ['carlos.lopez', hashedPassword, 'student', 'carlos.lopez@student.informatics.edu']
    ];

    const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password, role, email) VALUES (?, ?, ?, ?)');
    const insertManyUsers = db.transaction((users: any[]) => {
      for (const user of users) {
        insertUser.run(user);
      }
    });
    
    insertManyUsers(studentUsers);
    console.log('✅ Student users created');

    // Get the user IDs
    const users = await query('SELECT id, username FROM users WHERE role = ?', ['student']);

    // Create student records with Filipino names
    const studentData = [
      {
        username: 'juan.delacruz',
        student_id: '2024-001234',
        first_name: 'Juan',
        middle_name: 'Santos',
        last_name: 'Dela Cruz',
        suffix: null,
        student_type: 'Continuing',
        course: 'BSCS',
        year_level: 2,
        contact_number: '09171234567',
        address: '123 Rizal Street, Manila City',
        birth_date: '2004-05-15',
        gender: 'Male'
      },
      {
        username: 'maria.santos',
        student_id: '2024-001235',
        first_name: 'Maria',
        middle_name: 'Reyes',
        last_name: 'Santos',
        suffix: null,
        student_type: 'New',
        course: 'BSCS',
        year_level: 1,
        contact_number: '09187654321',
        address: '456 Bonifacio Avenue, Quezon City',
        birth_date: '2005-08-22',
        gender: 'Female'
      },
      {
        username: 'pedro.reyes',
        student_id: '2024-001236',
        first_name: 'Pedro',
        middle_name: 'Garcia',
        last_name: 'Reyes',
        suffix: 'Jr.',
        student_type: 'Transferee',
        course: 'BSIT',
        year_level: 2,
        contact_number: '09191234567',
        address: '789 Luna Street, Makati City',
        birth_date: '2003-12-10',
        gender: 'Male'
      },
      {
        username: 'ana.garcia',
        student_id: '2024-001237',
        first_name: 'Ana',
        middle_name: 'Lopez',
        last_name: 'Garcia',
        suffix: null,
        student_type: 'Scholar',
        course: 'BSCS',
        year_level: 1,
        contact_number: '09201234567',
        address: '321 Mabini Street, Pasig City',
        birth_date: '2005-03-18',
        gender: 'Female'
      },
      {
        username: 'carlos.lopez',
        student_id: '2024-001238',
        first_name: 'Carlos',
        middle_name: 'Mendoza',
        last_name: 'Lopez',
        suffix: null,
        student_type: 'Returning',
        course: 'BSIT',
        year_level: 3,
        contact_number: '09211234567',
        address: '654 Del Pilar Street, Taguig City',
        birth_date: '2002-07-25',
        gender: 'Male'
      }
    ];

    const insertStudent = db.prepare(`
      INSERT OR IGNORE INTO students (
        user_id, student_id, first_name, middle_name, last_name, suffix,
        student_type, course, year_level, contact_number, address, birth_date, gender, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `);

    const insertManyStudents = db.transaction((students: any[]) => {
      for (const student of students) {
        const user = users.find((u: any) => u.username === student.username);
        if (user) {
          insertStudent.run(
            user.id, student.student_id, student.first_name, student.middle_name,
            student.last_name, student.suffix, student.student_type, student.course,
            student.year_level, student.contact_number, student.address,
            student.birth_date, student.gender
          );
        }
      }
    });

    insertManyStudents(studentData);
    console.log('✅ Student records created');

    console.log('\n🎉 Sample students added successfully!\n');
    console.log('Student credentials (all passwords: student123):');
    console.log('================================================');
    console.log('Username: juan.delacruz   | Type: Continuing | Course: BSCS | Year: 2');
    console.log('Username: maria.santos    | Type: New        | Course: BSCS | Year: 1');
    console.log('Username: pedro.reyes     | Type: Transferee | Course: BSIT | Year: 2');
    console.log('Username: ana.garcia      | Type: Scholar    | Course: BSCS | Year: 1');
    console.log('Username: carlos.lopez    | Type: Returning  | Course: BSIT | Year: 3');
    console.log('================================================');
    console.log('\nPassword for all students: student123\n');

  } catch (error) {
    console.error('❌ Error adding sample students:', error);
    process.exit(1);
  }
}

addSampleStudents().then(() => {
  db.close();
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed to add sample students:', error);
  db.close();
  process.exit(1);
});
