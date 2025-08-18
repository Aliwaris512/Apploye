import redis

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

try:
    if r.ping():
        print("✅ Redis is connected and alive!")
except redis.ConnectionError:
    print("❌ Cannot connect to Redis. Make sure the server is running.")
