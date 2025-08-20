from database.structure import get_session
from sqlmodels.user_usage import User
from sqlmodel import select
from authentication.jwt_hashing import get_hashed_password

def reset_admin_password():
    print("=== Admin Password Reset Tool ===\n")
    
    # Admin user details
    ADMIN_EMAIL = "admin@example.com"
    NEW_PASSWORD = "Admin@1234"  # Change this to your desired password
    
    # Get database session
    session = next(get_session())
    
    try:
        # Find the admin user
        admin = session.exec(select(User).where(User.email == ADMIN_EMAIL)).first()
        
        if not admin:
            print("❌ Admin user not found in the database.")
            return False
            
        print(f"Found admin user: {admin.email} (ID: {admin.id})")
        
        # Hash the new password
        hashed_password = get_hashed_password(NEW_PASSWORD)
        
        # Update the password
        admin.password = hashed_password
        session.add(admin)
        session.commit()
        
        print("\n✅ Admin password has been reset successfully!")
        print(f"New password set to: {NEW_PASSWORD}")
        print("\nYou should now be able to log in with these credentials.")
        return True
        
    except Exception as e:
        print(f"\n❌ An error occurred: {str(e)}")
        session.rollback()
        return False
    finally:
        session.close()

if __name__ == "__main__":
    print("This script will reset the admin user's password.")
    print("WARNING: This will change the password for the admin user.")
    confirm = input("Are you sure you want to continue? (y/n): ")
    
    if confirm.lower() == 'y':
        reset_admin_password()
    else:
        print("Operation cancelled.")
