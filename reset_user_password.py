import sqlite3
from passlib.context import CryptContext
import os

def reset_user_password():
    # Path to the SQLite database
    db_path = os.path.join(os.getcwd(), 'activity_tracker.db')
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # User email and new password
        user_email = "aliwariskhan512@gmail.com"
        new_password = "password123"
        
        # Use the same hashing configuration as the backend
        pwd = CryptContext(schemes=['bcrypt'], deprecated='auto')
        hashed_password = pwd.hash(new_password)
        
        # Update the user password
        cursor.execute(
            "UPDATE user SET password = ? WHERE email = ?",
            (hashed_password, user_email)  # No need to decode as it's already a string
        )
        
        # Commit the changes
        conn.commit()
        print(f"✅ User {user_email} password has been reset to: {new_password}")
        
    except sqlite3.Error as e:
        print(f"❌ Error resetting user password: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Resetting user password...")
    reset_user_password()
