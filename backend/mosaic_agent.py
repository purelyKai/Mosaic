import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch

load_dotenv()

CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")

INDEX_NAME = "mosaic-index"
client = Elasticsearch(
    CLOUD_ID,
    api_key=ELASTIC_API_KEY,
)