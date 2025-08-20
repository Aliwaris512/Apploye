import httpx
import asyncio

async def list_endpoints():
    print("=== Listing Available API Endpoints ===\n")
    
    BASE_URL = "http://localhost:9000"
    
    # Endpoints to test
    endpoints = [
        "/",
        "/docs",
        "/openapi.json",
        "/login",
        "/signup",
        "/projects",
        "/projects/",
        "/api/v1/projects",
        "/api/v1/projects/",
        "/timesheets",
        "/attendance",
        "/payroll"
    ]
    
    async with httpx.AsyncClient() as client:
        for endpoint in endpoints:
            url = f"{BASE_URL}{endpoint}"
            try:
                # Try GET first
                response = await client.get(url, follow_redirects=True)
                print(f"{endpoint}:")
                print(f"  Status: {response.status_code}")
                print(f"  Content-Type: {response.headers.get('content-type')}")
                
                # For JSON responses, show available keys
                if 'application/json' in response.headers.get('content-type', ''):
                    try:
                        data = response.json()
                        if isinstance(data, dict):
                            print(f"  Keys: {list(data.keys())}")
                        elif isinstance(data, list):
                            print(f"  Items: {len(data)}")
                            if data and isinstance(data[0], dict):
                                print(f"  First item keys: {list(data[0].keys())}")
                    except Exception as e:
                        print(f"  Could not parse JSON: {str(e)}")
                
                # For HTML responses, check if it's the API docs
                elif 'text/html' in response.headers.get('content-type', ''):
                    if "Swagger UI" in response.text:
                        print("  Found: Swagger/OpenAPI documentation")
                    else:
                        print("  Found: HTML content")
                
                print()  # Add a blank line between endpoints
                
            except Exception as e:
                print(f"{endpoint}:")
                print(f"  Error: {str(e)}\n")

if __name__ == "__main__":
    asyncio.run(list_endpoints())
