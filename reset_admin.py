import sqlite3
import bcrypt
import os

def reset_admin_password():
    # Path to the SQLite database
    db_path = os.path.join(os.getcwd(), 'activity_tracker.db')
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # New password to set
        new_password = "admin123"
        
        # Hash the new password
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        # Update the admin password
        cursor.execute(
            "UPDATE user SET password = ? WHERE email = ?",
            (hashed_password.decode('utf-8'), 'admin@example.com')
        )
        
        # Commit the changes
        conn.commit()
        print(f"✅ Admin password has been reset to: {new_password}")
        
    except sqlite3.Error as e:
        print(f"❌ Error resetting admin password: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Resetting admin password...")
    reset_admin_password()
