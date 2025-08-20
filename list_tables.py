import sqlite3
import os

def list_tables():
    # Path to the SQLite database
    db_path = os.path.join(os.getcwd(), 'activity_tracker.db')
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get list of all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if tables:
            print("\nTables in the database:")
            print("-" * 80)
            for table in tables:
                table_name = table[0]
                print(f"\nTable: {table_name}")
                print("-" * 40)
                
                # Get table info
                try:
                    cursor.execute(f"PRAGMA table_info({table_name});")
                    columns = cursor.fetchall()
                    print("Columns:")
                    for col in columns:
                        print(f"  {col[1]} ({col[2]}) - {'PK' if col[5] > 0 else ''}")
                except sqlite3.Error as e:
                    print(f"  Could not get columns: {e}")
        else:
            print("No tables found in the database")
        
    except sqlite3.Error as e:
        print(f"❌ Error listing tables: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Listing database tables...")
    list_tables()
