@echo off
echo Setting up environment variables...

echo # API Configuration > .env
echo VITE_API_URL=http://localhost:9000 >> .env
echo. >> .env
echo # App Configuration >> .env
echo VITE_APP_NAME="Activity Tracker" >> .env
echo VITE_APP_ENV=development >> .env
echo VITE_APP_VERSION=1.0.0 >> .env

echo.
echo .env file has been created with the following content:
type .env
echo.
echo Environment setup complete!
