import os

from flask import Flask, render_template

app = Flask(__name__)


@app.context_processor
def inject_globals():
    return {
        "app_url": os.getenv("APP_URL", "https://pc.game-sense.ru").rstrip("/"),
        "api_url": os.getenv("API_URL", "https://api.game-sense.ru").rstrip("/"),
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/promotions")
def promotions():
    return render_template("promotions.html")


@app.route("/privacy")
def privacy():
    return render_template("privacy.html")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
