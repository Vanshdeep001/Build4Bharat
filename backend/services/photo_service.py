import io
from math import radians, sin, cos, sqrt, atan2
from config import settings

try:
    import exifread
except ImportError:
    exifread = None

try:
    import cloudinary
    import cloudinary.uploader

    if settings.CLOUDINARY_CLOUD_NAME:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
        )
except ImportError:
    cloudinary = None


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two GPS coordinates."""
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def _dms_to_decimal(dms_values, ref):
    """Convert EXIF GPS DMS (degrees, minutes, seconds) to decimal degrees."""
    try:
        degrees = float(dms_values.values[0].num) / float(dms_values.values[0].den)
        minutes = float(dms_values.values[1].num) / float(dms_values.values[1].den)
        seconds = float(dms_values.values[2].num) / float(dms_values.values[2].den)
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if ref in ["S", "W"]:
            decimal = -decimal
        return decimal
    except Exception:
        return None


def extract_gps_from_photo(photo_bytes: bytes) -> dict:
    """Extract GPS coordinates from photo EXIF data."""
    if exifread is None:
        return None

    try:
        tags = exifread.process_file(io.BytesIO(photo_bytes), details=False)
        lat_tag = tags.get("GPS GPSLatitude")
        lat_ref = tags.get("GPS GPSLatitudeRef")
        lng_tag = tags.get("GPS GPSLongitude")
        lng_ref = tags.get("GPS GPSLongitudeRef")

        if lat_tag and lng_tag and lat_ref and lng_ref:
            lat = _dms_to_decimal(lat_tag, str(lat_ref))
            lng = _dms_to_decimal(lng_tag, str(lng_ref))
            if lat is not None and lng is not None:
                return {"lat": lat, "lng": lng}
    except Exception as e:
        print(f"EXIF extraction error: {e}")

    return None


def upload_to_cloudinary(photo_bytes: bytes) -> str:
    """Upload photo to Cloudinary and return URL."""
    if cloudinary is None or not settings.CLOUDINARY_CLOUD_NAME:
        return None

    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(photo_bytes),
            folder="pmddky/submissions",
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None


def process_field_photo(
    photo_bytes: bytes,
    project_lat: float = None,
    project_lng: float = None,
) -> dict:
    """Process a field photo: upload, extract GPS, compare location.
    
    Returns dict with: photo_url, photo_gps, location_match, distance_km
    """
    # Upload
    photo_url = upload_to_cloudinary(photo_bytes)

    # Extract GPS
    photo_gps = extract_gps_from_photo(photo_bytes)

    # Compare
    location_match = None
    distance_km = None

    if photo_gps and project_lat is not None and project_lng is not None:
        distance_km = round(
            haversine(photo_gps["lat"], photo_gps["lng"], project_lat, project_lng), 2
        )
        location_match = distance_km <= 1.0

    return {
        "photo_url": photo_url,
        "photo_gps": photo_gps,
        "location_match": location_match,
        "distance_km": distance_km,
    }
