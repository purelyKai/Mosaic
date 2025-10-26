import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from flask import Flask, request, jsonify
import numpy as np
import openai
from find_places import find_places, get_place_information
from flask_cors import CORS

load_dotenv()

CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HOST_IP = os.getenv("HOST_IP")
HOST_PORT = int(os.getenv("HOST_PORT", 5000))
INDEX_NAME = "mosaic-index"


print(HOST_IP)
print(HOST_PORT)
client = Elasticsearch(
    CLOUD_ID,
    api_key=ELASTIC_API_KEY,
)
app = Flask(__name__)
CORS(app)

openai.api_key = OPENAI_API_KEY  # someones gotta make this

def generate_response_dict(recs): 
    dih = {}  # this will be a dict that gets returns to the frontend man, idek anymore im so tired
    for place_id in recs:
        name, image_url = get_place_information(place_id) 
        dih[str(place_id)] = {
            "image_url": image_url,
            "name": name,
        } 
    return dih 

def get_embedding(text):
    """Generate embedding for text using OpenAI."""
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=text,
        dimensions=512,  # 512 cuz we broke
    )
    return response.data[0].embedding


def normalize(vec):  # kai
    """Normalize a vector to unit length."""
    v = np.array(vec)
    return (v / np.linalg.norm(v)).tolist()


def get_user_vectors(user_ids):
    docs = client.mget(index=INDEX_NAME, ids=user_ids)
    vecs = []
    for id in user_ids:
        user_doc = client.search(
            index=INDEX_NAME,
            query={
                "bool": {
                    "must": [
                        {"term": {"doc_type": "user"}},
                        {"term": {"user_uuid": id}},
                    ],
                }
            },
            _source=["user_vec"],
        )
        user_vec = user_doc["hits"]["hits"][0]["_source"][
            "user_vec"
        ]  # ik im so good at coding, what company want me tho?
        vecs.append(user_vec)
    if not vecs:
        return None
    print(
        "succesfully got the dense vectors for the following users: " + str(user_ids)
    )  # lol
    return np.array(vecs)


def update_user_vector(user_id, place_id, alpha=0.2):
    """Update user embedding after liking a place."""
    user_doc = client.search(
        index=INDEX_NAME,
        query={  # should have linked this sooner but here it is: https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl
            "bool": {
                "must": [
                    {"term": {"user_uuid": user_id}},
                    {"term": {"doc_type": "user"}},
                ]
            }
        },
        _source=["user_vec"],
    )
    place_doc = client.search(
        index=INDEX_NAME,
        query={
            "bool": {
                "must": [
                    {"term": {"place_id": place_id}},
                    {"term": {"doc_type": "place"}},
                ]
            }
        },
        _source=["place_vec"],
    )

    # return type of client.get is either self or None
    if not user_doc or not place_doc:
        return jsonify({"message": "Error fetching related docs"}), 404

    r = update_view_count(place_doc["hits"]["hits"][0]["_id"])  # update view count
    user_source = user_doc["hits"]["hits"][0]["_source"]
    place_source = place_doc["hits"]["hits"][0]["_source"]

    # these are the vectors
    place_vec = np.array(place_source["place_vec"])
    user_vec = np.array(user_source["user_vec"])
    new_vec = normalize((1 - alpha) * user_vec + alpha * place_vec)  # kai
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

@app.before_request
def log_request_info():
    print(f"Incoming request: {request.method} {request.path}")
    print(f"Headers: {dict(request.headers)}")
    print(f"Body: {request.get_data(as_text=True)}")

# finds nearby places to a user and indexes them
@app.route("/api/find_places", methods=["POST"])
async def find_nearby_places():
    if request.is_json:
        data = request.get_json()

        lat = float(data.get("lat"))
        lon = float(data.get("lon"))
        radius = data.get("radius")
        if not all([lat, lon]):
            return jsonify({"message": "Missing required fields: lat, lon"}), 400

        # run async function synchronously
        response = find_places(lat, lon,radius_meters=int(radius))

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
        return jsonify({"populated backend with": doc}), 200

    return jsonify({"message": "Expected JSON"}), 400


@app.route("/api/add_user", methods=["POST"])
async def add_user():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing form_responses"}), 400

    form_text = data.get("form_responses")
    userId = data.get("userId")  # userId should come from supabase (frontend)

    # check if user exists in elastic db
    user_exists = client.exists(index=INDEX_NAME, id=userId)
    print(user_exists)
    if user_exists:
        return jsonify({"message": "User already exists"}), 400
    if form_text == "":
        form_text = "This user has no strong preferences and has no dietary preferences, is open to all food types, and is open to all activities."
    # generate initial embedding
    print(form_text)
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


# gotta generate the group feed off similar interests, but unsure how to go about it
@app.route("/api/generate_group_feed", methods=["POST"])
async def gen_group_sim():
    if request.is_json:
        data = request.get_json()

        # whats good security?
        user_ids = data.get("user_ids")
        group_lat = float(data.get("lat"))
        group_long = float(data.get("long"))
        radius = data.get("radius")
        if not all([user_ids, group_lat, group_long, radius]):
            return jsonify({"message": "no group location or user ids provided"}), 400

        # collect all the user vectors to later mean them out
        user_vectors = get_user_vectors(user_ids)
        if user_vectors is None or user_vectors.size == 0:
            return (
                jsonify(
                    {
                        "message": "Could not find valid user vectors for the group. Check IDs."
                    }
                ),
                404,
            )

        # avg out the vectors basically, SO ai for this math
        # kai
        group_centroid_vec = np.mean(user_vectors, axis=0)
        normalized_group_vec = normalize(np.array(group_centroid_vec))

        # start k-neighbors search
        k = 10  # recomeend top 10 places
        num_candidates_val = 50  # can really be anything
        search_query = {
            "knn": {
                "field": "place_vec",
                "k": k,
                "num_candidates": num_candidates_val,
                "query_vector": normalized_group_vec,
                "filter": {
                    "bool": {
                        "must": [
                            {"term": {"doc_type": "place"}},
                            {
                                "geo_distance": {
                                    "distance": str(radius) + "mi",
                                    "location": {"lat": group_lat, "lon": group_long},
                                }
                            },
                        ]
                    }
                },
            }
        }
        # lets just pray this works? ^
        try:
            res = client.search(
                index=INDEX_NAME,
                body=search_query,
                size=k,
                _source=["place_vec"],
            )
            recs = []
            for hit in res["hits"]["hits"]:
                recs.append(hit["_source"]["place_id"])
            dih = generate_response_dict(recs)
            return {"places": dih}, 200
        except Exception as e:
            print(f"Ran into exception {e}")
            return jsonify({"message": "ran into error parsing places for groups"})
    return jsonify({"message": "error parsing json"}), 400


# don't think this should be async for now, might cause race condition?
@app.route("/api/update_user_profile", methods=["POST"])
def adjust_user_vector():
    if request.is_json:
        data = request.get_json()
        userId = data.get("userId")
        placeId = data.get("placeId")

        if not userId or not placeId:
            return jsonify({"message": "need both place and user id"}), 400

        return update_user_vector(userId, placeId)

    return jsonify({"message": "expected json"}), 400


@app.route("/api/find_x_radius_locations", methods=["POSt"])
async def find_locations():
    if request.is_json:
        data = request.get_json()

        lat = float(data.get("lat"))
        long = float(data.get("long"))
        radi = data.get("radius")
        if not all([lat, long, radi]):
            return jsonify({"message": "invalid values"}), 400
        place_docs = client.search(
            index=INDEX_NAME,
            query={
                "bool": {
                    "must": [{"term": {"doc_type": "place"}}],
                    "filter": {
                        "geo_distance": {
                            "distance": str(radi) + "mi",
                            "location": {"lat": lat, "lon": long},
                        }
                    },
                }
            },
            _source=["place_id"],
        )

        if not place_docs:
            return jsonify({"message": "no places found in specified location"}), 400

        place_ids = []
        for hit in place_docs["hits"]["hits"]:
            place_ids.append(hit["_source"]["place_id"])
        dih = generate_response_dict(place_ids)
        return {"places": dih}, 200
    return jsonify({"message": "error parsing json"}), 400


# Run the Flask app
if __name__ == "__main__":
    app.run(host=HOST_IP, port=HOST_PORT, debug=True)
