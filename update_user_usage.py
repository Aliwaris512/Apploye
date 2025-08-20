import os
import shutil

# Define file paths
current_dir = os.path.dirname(os.path.abspath(__file__))
original_file = os.path.join(current_dir, 'sqlmodels', 'user_usage.py')
backup_file = os.path.join(current_dir, 'sqlmodels', 'user_usage_backup.py')
new_file = os.path.join(current_dir, 'sqlmodels', 'user_usage_new.py')

print("Updating user_usage.py with new password validation...")

# Backup the original file
if os.path.exists(original_file):
    shutil.copy2(original_file, backup_file)
    print(f"Created backup at: {backup_file}")

# Replace with new version
if os.path.exists(new_file):
    shutil.copy2(new_file, original_file)
    print(f"Updated {original_file} with new password validation")
    print("Restart the server for changes to take effect")
else:
    print(f"Error: {new_file} not found")
