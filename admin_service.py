from flask import Flask
from flask_cors import CORS
from db import init_db

init_db()

app = Flask(__name__)

# Configuración de CORS para permitir peticiones desde React
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['SECRET_KEY'] = 'admin-secret-key'

from admin_views import admin_bp
app.register_blueprint(admin_bp)

if __name__ == '__main__':
    print("🛠️ Admin Service running on http://localhost:5001")
    app.run(debug=True, port=5001, host='0.0.0.0')