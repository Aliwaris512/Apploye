import sqlite3
import os

def list_users():
    # Path to the SQLite database
    db_path = os.path.join(os.getcwd(), 'activity_tracker.db')
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all users
        cursor.execute("SELECT id, name, email, role FROM user")
        users = cursor.fetchall()
        
        if users:
            print("\nUsers in the database:")
            print("-" * 80)
            for user in users:
                print(f"ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Role: {user[3]}")
        else:
            print("No users found in the database")
        
    except sqlite3.Error as e:
        print(f"❌ Error listing users: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Listing users in the database...")
    list_users()
