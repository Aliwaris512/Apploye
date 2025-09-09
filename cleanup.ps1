# Cleanup Script for Activity Tracker Project
# This script will remove unnecessary files and directories

# Files to remove
$filesToRemove = @(
    "README.txt",
    "cd",
    "check3.py",
    "check_db.py",
    "check_db_connection.py",
    "create_admin_user.py",
    "device_id.txt",
    "direct_login_test.log",
    "fix_cors.py",
    "fix_imports.py",
    "generate_env.py",
    "init_db.py",
    "init_enhanced_db.py",
    "list_endpoints.py",
    "list_routes.py",
    "list_routes_direct.py",
    "list_routes_final.py",
    "list_tables.py",
    "list_users.py",
    "main.py",
    "reset_admin.py",
    "reset_admin_password.py",
    "reset_user_password.py",
    "run.py",
    "setup.py",
    "test_api.py",
    "test_auth.py",
    "test_db.py",
    "test_register.py",
    "test_register_endpoint.py",
    "test_register_fixed.py",
    "test_routes.py",
    "update_user_table.py",
    "update_user_usage.py",
    "utils.py",
    "vapid_private.pem",
    "vapid_public.pem"
)

# Directories to remove
$dirsToRemove = @(
    "__pycache__",
    "backup_scripts",
    "migrations",
    "notifications",
    "push_notify",
    "routers",
    "screenshots",
    "sqlmodels",
    "uploads"
)

# Remove files
foreach ($file in $filesToRemove) {
    $filePath = Join-Path -Path $PSScriptRoot -ChildPath $file
    if (Test-Path $filePath) {
        Write-Host "Removing file: $file"
        Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
    }
}

# Remove directories
foreach ($dir in $dirsToRemove) {
    $dirPath = Join-Path -Path $PSScriptRoot -ChildPath $dir
    if (Test-Path $dirPath) {
        Write-Host "Removing directory: $dir"
        Remove-Item -Path $dirPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Cleanup completed!"
