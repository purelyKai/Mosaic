import os
from google.maps import places_v1
from google.type import latlng_pb2
from dotenv import load_dotenv

load_dotenv()

PLACES_API_KEY = os.getenv("PLACES_API_KEY")

client = places_v1.PlacesClient(
  # Instantiates the Places client, passing the API key
  client_options={"api_key": PLACES_API_KEY}
)
def get_images(place_id): 
    pass
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
    fieldMask = "places.id,places.displayName,places.generativeSummary"

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

