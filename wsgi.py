from app import app, db
from flask_migrate import Migrate
from waitress import serve
from app import app   # import your Flask app object


migrate = Migrate(app, db)
if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=5000)
