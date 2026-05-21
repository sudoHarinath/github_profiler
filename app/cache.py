import time
from app.config import CACHE_TTL_SECONDS

class TimeToLiveCache:
    def __init__(self):
        # Format: { "username": {"data": {...}, "timestamp": 12345678} }
        self._store = {}

    def get(self, key: str):
        if key not in self._store:
            return None
        
        cached_item = self._store[key]
        # Check if the data has survived longer than our allowed window
        if time.time() - cached_item["timestamp"] > CACHE_TTL_SECONDS:
            del self._store[key]  # Clear expired entry
            return None
            
        return cached_item["data"]

    def set(self, key: str, value: dict):
        self._store[key] = {
            "data": value,
            "timestamp": time.time()
        }

# Instantiate a single global instance for our application context
profile_cache = TimeToLiveCache()