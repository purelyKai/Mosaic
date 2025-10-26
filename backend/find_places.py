import os
import requests
from google.maps import places_v1
from google.type import latlng_pb2
from dotenv import load_dotenv

load_dotenv()

PLACES_API_KEY = os.getenv("PLACES_API_KEY")
URL = f"https://places.googleapis.com/v1/places/" # need to append PLACE_ID to end of this

client = places_v1.PlacesClient(
  # Instantiates the Places client, passing the API key
  client_options={"api_key": PLACES_API_KEY}
)

def get_place_information(place_id):
    """
    Fetches Place Details (photos, displayName) and constructs the direct image URL.
    Returns: A tuple (img_url, display_name) or an error string.
    """
    full_url = URL + place_id
    fieldMask = "photos,displayName"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": PLACES_API_KEY,
        "X-Goog-FieldMask": fieldMask
    }
    
    res = requests.get(full_url, headers=headers)
    
    if res.status_code == 200:
        data = res.json()
        
        # Get display name first
        place_name = data['displayName']['text']
        
        # Check if photos exist
        if 'photos' not in data or not data['photos']:
            print(f"No photos found for place: {place_name}")
            # Return name with a None URL if no photo is available
            return (None, place_name)
        
        photo_resource_name = data['photos'][0]['name']
        
        print("Place Name:", place_name)
        print("Photo Resource Name (Token):", photo_resource_name)
        
        # Construct the Final Image URL
        img_url = data['photos'][0]['flagContentUri']
        
        print("Final Image URL:", img_url)
        
        # 🚨 FINAL FIX: Return the image URL and the display name as a tuple
        return (place_name,img_url) 
        
    else:
        print(f"Error fetching details (Status {res.status_code}): {res.text}")
        return ("something went wrong bro", None) # Return error string and None for name
    
def find_places(lat, lng, radius_meters=20000, types=["restaurant"]):
    center_point = latlng_pb2.LatLng(latitude=lat, longitude=lng)
    circle_area = places_v1.types.Circle(
        center=center_point,
        radius=radius_meters
    )
    # Add the circle to the location restriction
    location_restriction = places_v1.SearchNearbyRequest.LocationRestriction(
        circle=circle_area
    )

    # Build the request
    request = places_v1.SearchNearbyRequest(
        location_restriction=location_restriction,
        max_result_count=10, # restricting max results so we dont get too many entries in our db right now
        included_types=types
    )

    # Set the field mask
    # https://developers.google.com/maps/documentation/places/web-service/place-details#fieldmask
    # format: places.<field_name> 
    # if you want more fields, make them comma separated
    fieldMask = "places.id,places.displayName,places.generativeSummary,places.photos"

    # Make the request
    response = client.search_nearby(request=request, metadata=[("x-goog-fieldmask",fieldMask)])
    return response

# alternatively we could create a CRON job that fetches and populates places every few X hours 
# and goes across common tourist destinations across the world. Then we wouldn't need to fetch the places
# and insert them into the vector db every single time a user opens the app.
# Or we can do a mix of both
# It limits our availability to common tourist destinations but we would be able to expand in the future and
# it makes it quicker to load.

# also one more thought for the vector embeddings, we could make it so we also have a CRON job updating a user embedding.
# or every ~5 likes they do we update their embedding.
# because i have a hunch that the actual modification of the user embedding will take a good amount of time. rengenerating an embedding every 
# like will be annoying if they are saving often.

