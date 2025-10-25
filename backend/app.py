import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from flask import Flask, request, jsonify
import numpy as np
import openai
from find_places import find_places

load_dotenv()

CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

INDEX_NAME = "mosaic-index"
client = Elasticsearch(
    CLOUD_ID,
    api_key=ELASTIC_API_KEY,
)

app = Flask(__name__)

openai.api_key = OPENAI_API_KEY  # someones gotta make this


def get_embedding(text):
    """Generate embedding for text using OpenAI."""
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=text,
        dimensions=512, # 512 cuz we broke
    )
    return response.data[0].embedding


def normalize(vec):
    """Normalize a vector to unit length."""
    v = np.array(vec)
    return (v / np.linalg.norm(v)).tolist()


def update_user_vector(user_id, place_id, alpha=0.2):
    """Update user embedding after liking a place."""
    user_doc = client.get(index=INDEX_NAME, id=user_id)
    place_doc = client.get(index=INDEX_NAME, id=place_id)
    
    # return type of client.get is either self or None  
    if not user_doc or place_doc:
        return jsonify({"message": "Error fetching related docs"}), 404
    place_vec = np.array(place_doc["_source"]["place_vec"])
    user_vec = np.array(user_doc["_source"]["user_vec"])
    new_vec = normalize((1 - alpha) * user_vec + alpha * place_vec)
    try: 
        client.update(
            index=INDEX_NAME,
            id=user_id,
            body={"doc": {"user_vec": new_vec}},
        )

        return jsonify({"message": f"User {user_id} vector updated"}), 200
    except Exception as e:
        print(f"ran into error when trying to update user vector: {e}")
        return jsonify({f"message": "ran into an exception"}), 400

def update_view_count(doc_id):
    """
    Atomically increments the 'view_count' field for the specified document.
    If the field does not exist, it initializes it to 1.
    """
    try:
        response = client.update(
            index=INDEX_NAME,
            id=doc_id,
            script={
                "source": "ctx._source.view_count = ctx._source.view_count + params.inc",
                "params": {"inc": 1},
            },
            upsert={"view_count": 1},
        )
        return

    except Exception as e:
        print(f"Update error: {e}")
        return jsonify({"message": "Failed to update view count."}), 500


# finds nearby places to a user and indexes them
@app.route("/api/find_places", methods=["GET", "POST"])
async def find_nearby_places():
    if request.is_json:
        data = request.get_json()

        lat = float(data.get("lat"))
        lon = float(data.get("lon"))

        if not all([lat, lon]):
            return jsonify({"message": "Missing required fields: lat, lon"}), 400

        # run async function synchronously
        response = find_places(lat, lon)

        for place in response.places:
            place_id = place.id
            
            # skip if we already processed this place 
            doc_exists = client.exists(id=place_id, index=INDEX_NAME)
            if doc_exists:
                continue
            
            place_name = str(getattr(place, "display_name", "No title found"))
         
            summary = "" 
            if hasattr(
                place, "generative_summary"
            ):  # sometimes generative summary is unavailable
                summary = place.generative_summary.overview.text
            
            print(place) 
            
            # create embedded vector for the place based off summary            
            place_dense_vec = get_embedding(summary)           

            doc = {
                "location": {
                    "lat": lat,
                    "lon": lon,
                },
                "place_id": place_id,
                "place_summary_text": summary,
                "place_name": place_name,
                "place_vec": place_dense_vec,
                "doc_type": "place",
                "view_count": 1,
            }

            try:
                res = client.index(index=INDEX_NAME, id=place_id, document=doc)
            except Exception as e:
                print(f"Indexing error: {e}")
                # we just continue lol
                
        # we will need to return more data to the user from places api like name, photos, etc.
        return jsonify({"places": "hi"}), 200

    return jsonify({"message": "Expected JSON"}), 400


@app.route("/api/add_user", methods=["GET", "POST"])
def add_user():
    data = request.get_json()
    if not data or "form_responses" not in data:
        return jsonify({"message": "Missing form_responses"}), 400

    form_text = data.get("form_responses")
    userId = data.get("userId")  # userId should come from supabase (frontend)

    # check if user exists in elastic db
    user_exists = client.exists(index=INDEX_NAME, id=userId)

    if user_exists:
        return jsonify({"message": "User already exists"}), 400

    # generate initial embedding
    user_embedding = get_embedding(form_text)

    doc = {
        "doc_type": "user",
        "user_uuid": userId,
        "user_vec": user_embedding,
    }

    try:
        client.index(index=INDEX_NAME, id=userId, document=doc)
        return jsonify({"message": "User created successfully", "userId": userId}), 200
    except Exception as e:
        print(f"Indexing error: {e}")
        return jsonify({"message": "Failed to create user"}), 500


# Run the Flask app
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
