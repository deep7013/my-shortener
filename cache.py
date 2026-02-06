# cache.py
import os
import logging
from datetime import datetime, timezone
import redis

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- Redis client ----------
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=int(os.getenv("REDIS_DB", "0")),
    password=os.getenv("REDIS_PASSWORD") or None,
    decode_responses=True,
)

# Cap TTL to 30 days unless expiry is sooner
MAX_TTL_SECONDS = 30 * 24 * 3600

def _key(slug: str) -> str:
    """Namespaced Redis key for a short URL."""
    return f"slug:{slug}"

def get_cached_url(slug: str):
    try:
        url = redis_client.get(_key(slug))
        if url:
            logger.debug(f"[CACHE HIT] slug={slug}")
        else:
            logger.debug(f"[CACHE MISS] slug={slug}")
        return url
    except Exception as e:
        logger.error(f"[CACHE ERROR] get slug={slug}: {e}")
        return None

def set_cached_url(slug: str, long_url: str, expires_at=None):
    """
    Store URL in cache with TTL aligned to expiry.
    Falls back to MAX_TTL_SECONDS when no expiry is provided.
    """
    try:
        ttl = MAX_TTL_SECONDS
        if expires_at:
            delta = (expires_at - datetime.now(timezone.utc)).total_seconds()
            ttl = int(delta)
            if ttl <= 0:
                logger.debug(f"[CACHE SKIP] slug={slug} expired TTL={ttl}")
                return
            ttl = min(ttl, MAX_TTL_SECONDS)

        redis_client.set(_key(slug), long_url, ex=ttl)
        logger.debug(f"[CACHE SET] slug={slug} ttl={ttl}")
    except Exception as e:
        logger.error(f"[CACHE ERROR] set slug={slug}: {e}")

def invalidate_cached_keys(slug: str | None, short: str | None = None):
    try:
        keys = []
        if slug:
            keys.append(_key(slug))
        if short and short != slug:
            keys.append(_key(short))
        if keys:
            redis_client.delete(*keys)
    except Exception as e:
        print(f"[CACHE ERROR] {e}")
