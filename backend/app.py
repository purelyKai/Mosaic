import uuid
import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from flask import Flask, request, jsonify

load_dotenv()

CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")
INDEX_NAME = "mosaic-index"
client = Elasticsearch(
    CLOUD_ID,
    api_key=ELASTIC_API_KEY,
)

app = Flask(__name__)


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

        return (
            jsonify(
                {
                    "message": f"View count updated. Result: {response['result']}",
                    "id": doc_id,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Update error: {e}")
        return jsonify({"message": "Failed to update view count."}), 500


@app.route("/api/upload_place", methods=["GET", "POST"])
def upload_event():
    if request.is_json:
        data = request.get_json()

        # parse the json fields
        lat = float(data.get("lat"))
        long = float(data.get("lon"))
        summary = data.get("summary")
        place_id = data.get("place_id")

        if not all([lat, long, summary, place_id]):
            return (
                jsonify(
                    {"message": "Missing required fields: lat, long, summary, place_id"}
                ),
                400,
            )

        # if doc exists just update view count
        doc_exists = client.exists(id=place_id, index=INDEX_NAME)
        if doc_exists:
            return update_view_count(place_id)

        doc = {
            "location": {
                "lat": lat,
                "lon": long,  # somebody messed up and created a typo so long is actually lon
            },
            "place_id": place_id,
            "place_summary": summary,
            "doc_type": "place",
            "view_count": 1,
        }
        try:
            response = client.index(index=INDEX_NAME, id=place_id, document=doc)
            return jsonify({"message": "Doc indexed succesfully"}), 200
        except Exception as e:
            print("Indexing error %s", e)
            return jsonify({"message": "Failed to index doc"}), 500
    return jsonify({"message": "expected JSON"}), 500


@app.route("/api/add_user", methods=["GET", "POST"])
def add_user():
    # for future kev: do we even need anything here from frontend fr? 
    user_uuid = str(uuid.uuid4())
    doc = {
        "doc_type": "user",
        "uuid": user_uuid,
        # seb gotta do some work here fr fr
    }
    try:
        response = client.index(index=INDEX_NAME, document=doc)
        return jsonify({"message": "user created succesfully, uuid: " + user_uuid}), 400
    except Exception as e:
        print("oopsie woopsie something went wrong: %s", e)
        return jsonify({"message": "Something went wrong"}), 400