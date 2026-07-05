from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/promotions')
def promotions():
    return render_template("promotions.html")

@app.route('/privacy')
def privacy():
    return render_template("privacy.html")


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5001)