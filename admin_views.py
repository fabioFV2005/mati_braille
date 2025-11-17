from flask import Blueprint, request, jsonify
from db import get_db, now_ms
import csv
import io
import hashlib
import secrets

admin_bp = Blueprint("admin_bp", __name__)

# Password hashing - same method as FastAPI user_service
SCRYPT_N = 16384
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_DKLEN = 64
SALT_SIZE = 16

def get_password_hash(password: str) -> str:
    """Hash password using scrypt - compatible with FastAPI user_service"""
    salt = secrets.token_bytes(SALT_SIZE)
    derived = hashlib.scrypt(
        password.encode(),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_DKLEN
    )
    return salt.hex() + '$' + derived.hex()

@admin_bp.route("/admin", methods=["GET"])
def admin_index():
    db = get_db()
    users = db.execute("SELECT * FROM users ORDER BY id DESC").fetchall()
    students = db.execute("SELECT * FROM users WHERE role='student' ORDER BY full_name").fetchall()
    teachers = db.execute("SELECT * FROM users WHERE role='teacher' ORDER BY full_name").fetchall()
    devices = db.execute("SELECT * FROM devices ORDER BY id").fetchall()
    classes = db.execute("""
        SELECT c.id, c.name, c.teacher_id, u.full_name as teacher_name, COUNT(cs.student_id) as students_count
        FROM classes c
        LEFT JOIN users u ON c.teacher_id = u.id
        LEFT JOIN class_students cs ON cs.class_id = c.id
        GROUP BY c.id
        ORDER BY c.id DESC
    """).fetchall()
    return jsonify({
        "users": users,
        "students": students,
        "teachers": teachers,
        "devices": devices,
        "classes": classes
    }), 200

@admin_bp.route("/admin/import_students", methods=["POST"])
def import_students():
    file = request.files.get("csv_file")
    if not file:
        return jsonify({"error": "No file provided"}), 400
    try:
        stream = io.TextIOWrapper(file.stream, encoding='utf-8')
        reader = csv.DictReader(stream)
        db = get_db()
        imported = 0
        for row in reader:
            username = (row.get('username') or "").strip()
            full_name = (row.get('full_name') or "").strip()
            ci = row.get('ci') or None
            password = row.get('password') or "password"
            if not username:
                continue
            exists = db.execute("SELECT id FROM users WHERE username=%s", (username,)).fetchone()
            if exists:
                continue
            pwd = get_password_hash(password)
            db.execute("INSERT INTO users (username, full_name, role, password, created_at, active, CI) VALUES (%s,%s,%s,%s,CURRENT_TIMESTAMP,%s,%s)",
                       (username, full_name, 'student', pwd, 1, ci))
            imported += 1
        db.commit()
        return jsonify({"message": f"Imported {imported} students"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/admin/create_user", methods=["POST"])
def create_user():
    if request.is_json:
        data = request.get_json()
        username = (data.get("username") or "").strip()
        full_name = (data.get("full_name") or "").strip()
        role = (data.get("role") or "student").strip()
        password = data.get("password") or ""
        ci = data.get("ci") or None
        active = 1 if str(data.get("active", "1")) == "1" else 0
    else:
        username = (request.form.get("username") or "").strip()
        full_name = (request.form.get("full_name") or "").strip()
        role = (request.form.get("role") or "student").strip()
        password = request.form.get("password") or ""
        ci = request.form.get("ci") or None
        active = 1 if request.form.get("active", "1") == "1" else 0

    if not username:
        return jsonify({"error": "Username is required"}), 400

    db = get_db()
    exists = db.execute("SELECT id FROM users WHERE username=%s", (username,)).fetchone()
    if exists:
        return jsonify({"error": "Username already exists"}), 400

    pwd = get_password_hash(password) if password else get_password_hash("password")
    db.execute(
        "INSERT INTO users (username, full_name, role, password, created_at, active, CI) VALUES (%s,%s,%s,%s,CURRENT_TIMESTAMP,%s,%s)",
        (username, full_name, role, pwd, active, ci)
    )
    db.commit()
    
    return jsonify({"message": "User created successfully", "username": username}), 201

@admin_bp.route("/admin/create_device", methods=["POST"])
def create_device():
    if request.is_json:
        data = request.get_json()
        device_id = (data.get("device_id") or "").strip()
        name = (data.get("name") or "").strip()
    else:
        device_id = (request.form.get("device_id") or "").strip()
        name = (request.form.get("name") or "").strip()
    
    if not device_id:
        return jsonify({"error": "Device ID is required"}), 400
    
    db = get_db()
    db.execute("INSERT INTO devices (id, name, last_seen) VALUES (%s,%s,%s) ON DUPLICATE KEY UPDATE name=VALUES(name), last_seen=VALUES(last_seen)",
               (device_id, name or device_id, now_ms()))
    db.commit()
    
    return jsonify({"message": "Device created successfully", "device_id": device_id}), 201

@admin_bp.route("/admin/create_class", methods=["POST"])
def create_class():
    if request.is_json:
        data = request.get_json()
        name = (data.get("name") or "").strip()
        teacher_id = data.get("teacher_id") or None
    else:
        name = (request.form.get("name") or "").strip()
        teacher_id = request.form.get("teacher_id") or None
    
    if not name:
        return jsonify({"error": "Class name is required"}), 400
    
    if teacher_id == "":
        teacher_id = None
    
    db = get_db()
    db.execute("INSERT INTO classes (name, teacher_id, created_at) VALUES (%s,%s,CURRENT_TIMESTAMP)",
               (name, teacher_id))
    db.commit()
    
    return jsonify({"message": "Class created successfully", "name": name}), 201

@admin_bp.route("/admin/assign_teacher", methods=["POST"])
def assign_teacher():
    if request.is_json:
        data = request.get_json()
        class_id = data.get("class_id")
        teacher_id = data.get("teacher_id") or None
    else:
        class_id = request.form.get("class_id")
        teacher_id = request.form.get("teacher_id") or None
    
    if not class_id:
        return jsonify({"error": "Class ID is required"}), 400
    
    if teacher_id == "":
        teacher_id = None
    
    db = get_db()
    db.execute("UPDATE classes SET teacher_id=%s WHERE id=%s", (teacher_id, class_id))
    db.commit()
    
    return jsonify({"message": "Teacher assigned successfully"}), 200

@admin_bp.route("/admin/add_students_to_class", methods=["POST"])
def add_students_to_class():
    if request.is_json:
        data = request.get_json()
        class_id = data.get("class_id")
        student_ids_raw = data.get("student_ids") or ""
    else:
        class_id = request.form.get("class_id")
        student_ids_raw = request.form.get("student_ids") or ""
    
    if not class_id or not student_ids_raw:
        return jsonify({"error": "Class ID and student IDs are required"}), 400
    
    if isinstance(student_ids_raw, list):
        student_ids = student_ids_raw
    else:
        student_ids = [s.strip() for s in str(student_ids_raw).split(",") if s.strip()]
    
    db = get_db()
    added = 0
    for sid in student_ids:
        exists = db.execute("SELECT id FROM class_students WHERE class_id=%s AND student_id=%s", (class_id, sid)).fetchone()
        if not exists:
            db.execute("INSERT INTO class_students (class_id, student_id, created_at) VALUES (%s,%s,CURRENT_TIMESTAMP)", (class_id, sid))
            added += 1
    db.commit()
    
    return jsonify({"message": f"Added {added} students to class"}), 200

@admin_bp.route("/admin/delete_class", methods=["POST"])
def delete_class():
    """Eliminar una clase/lección del sistema"""
    if request.is_json:
        data = request.get_json()
        class_id = data.get("class_id")
    else:
        class_id = request.form.get("class_id")
    
    if not class_id:
        return jsonify({"error": "Class ID is required"}), 400
    
    db = get_db()
    
    # Primero eliminar estudiantes asociados
    db.execute("DELETE FROM class_students WHERE class_id=%s", (class_id,))
    
    # Luego eliminar la clase
    db.execute("DELETE FROM classes WHERE id=%s", (class_id,))
    db.commit()
    
    return jsonify({"message": "Class deleted successfully"}), 200

@admin_bp.route("/admin/update_user", methods=["POST"])
def update_user():
    """Actualizar información de un usuario"""
    if request.is_json:
        data = request.get_json()
        user_id = data.get("user_id")
        username = (data.get("username") or "").strip()
        full_name = (data.get("full_name") or "").strip()
        email = data.get("email") or None
        password = data.get("password") or None
        active = data.get("active", 1)
    else:
        user_id = request.form.get("user_id")
        username = (request.form.get("username") or "").strip()
        full_name = (request.form.get("full_name") or "").strip()
        email = request.form.get("email") or None
        password = request.form.get("password") or None
        active = request.form.get("active", 1)
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    db = get_db()
    
    # Verificar que el usuario existe
    user = db.execute("SELECT id FROM users WHERE id=%s", (user_id,)).fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Verificar que el username no esté en uso por otro usuario
    existing = db.execute("SELECT id FROM users WHERE username=%s AND id!=%s", (username, user_id)).fetchone()
    if existing:
        return jsonify({"error": "Username already exists"}), 400
    
    # Actualizar datos básicos
    if password:
        pwd = get_password_hash(password)
        db.execute(
            "UPDATE users SET username=%s, full_name=%s, password=%s, active=%s WHERE id=%s",
            (username, full_name, pwd, active, user_id)
        )
    else:
        db.execute(
            "UPDATE users SET username=%s, full_name=%s, active=%s WHERE id=%s",
            (username, full_name, active, user_id)
        )
    
    db.commit()
    
    return jsonify({"message": "User updated successfully"}), 200

@admin_bp.route("/admin/delete_user", methods=["POST"])
def delete_user():
    """Eliminar un usuario del sistema"""
    if request.is_json:
        data = request.get_json()
        user_id = data.get("user_id")
    else:
        user_id = request.form.get("user_id")
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    db = get_db()
    
    # Verificar que el usuario existe
    user = db.execute("SELECT id, role FROM users WHERE id=%s", (user_id,)).fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Si es estudiante, eliminar de class_students
    if user['role'] == 'student':
        db.execute("DELETE FROM class_students WHERE student_id=%s", (user_id,))
    
    # Si es profesor, desasignar de clases
    if user['role'] == 'teacher':
        db.execute("UPDATE classes SET teacher_id=NULL WHERE teacher_id=%s", (user_id,))
    
    # Eliminar el usuario
    db.execute("DELETE FROM users WHERE id=%s", (user_id,))
    db.commit()
    
    return jsonify({"message": "User deleted successfully"}), 200

@admin_bp.route("/admin/get_class_details/<int:class_id>", methods=["GET"])
def get_class_details(class_id):
    """Obtener detalles de una clase específica con sus estudiantes"""
    db = get_db()
    
    # Obtener información de la clase
    cls = db.execute("""
        SELECT c.id, c.name, c.teacher_id, u.full_name as teacher_name, c.created_at
        FROM classes c
        LEFT JOIN users u ON c.teacher_id = u.id
        WHERE c.id = %s
    """, (class_id,)).fetchone()
    
    if not cls:
        return jsonify({"error": "Class not found"}), 404
    
    # Obtener estudiantes de la clase
    students = db.execute("""
        SELECT u.id, u.username, u.full_name, cs.created_at as enrolled_at
        FROM class_students cs
        JOIN users u ON cs.student_id = u.id
        WHERE cs.class_id = %s
        ORDER BY u.full_name
    """, (class_id,)).fetchall()
    
    return jsonify({
        "class": cls,
        "students": students
    }), 200
