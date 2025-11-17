from flask import Blueprint, request, jsonify
import time
import uuid
from db import get_db_connection

teacher_bp = Blueprint("teacher_bp", __name__)

@teacher_bp.route("/api/teacher/dashboard")
def api_teacher_dashboard():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as total_students FROM users WHERE role='student'")
        total_students = cursor.fetchone()["total_students"]

        cursor.execute("SELECT COUNT(*) as total_lessons FROM lessons")
        total_lessons = cursor.fetchone()["total_lessons"]

        cursor.execute("SELECT * FROM users WHERE role='student'")
        students = cursor.fetchall()

        student_progress = []
        for student in students:
            cursor.execute("""
                SELECT COUNT(*) as attempts, 
                       IFNULL(SUM(correct),0) as corrects, 
                       MAX(ts) as last_ts 
                FROM attempts 
                WHERE user_id=%s
            """, (student["id"],))
            q = cursor.fetchone()
            attempts = q["attempts"] or 0
            corrects = q["corrects"] or 0
            accuracy = round(corrects/attempts*100, 2) if attempts > 0 else 0

            cursor.execute("""
                SELECT COUNT(DISTINCT lesson_id) as completed 
                FROM sessions 
                WHERE user_id=%s AND finished_at IS NOT NULL
            """, (student["id"],))
            completed_result = cursor.fetchone()
            completed = completed_result["completed"] if completed_result else 0

            last_ts = q["last_ts"]
            last_activity = None
            if last_ts:
                try:
                    last_activity = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(last_ts/1000))
                except:
                    last_activity = str(last_ts)

            student_progress.append({
                "id": student["id"],
                "name": student["full_name"],
                "username": student["username"],
                "attempts": attempts,
                "corrects": corrects,
                "accuracy": accuracy,
                "completed": completed,
                "last_activity": last_activity
            })

        cursor.close()
        conn.close()

        return jsonify({
            "total_students": total_students,
            "total_lessons": total_lessons,
            "active_sessions": len(student_progress),
            "students": student_progress
        })

    except Exception as e:
        try:
            cursor.close()
        except:
            pass
        try:
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

@teacher_bp.route("/api/teacher/classes/<int:teacher_id>", methods=["GET"])
def get_teacher_classes(teacher_id):
    """Obtener las clases asignadas a un profesor"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Obtener clases del profesor con conteo de estudiantes
        cursor.execute("""
            SELECT 
                c.id,
                c.name,
                c.description,
                c.teacher_id,
                COUNT(DISTINCT cs.student_id) as student_count,
                COUNT(DISTINCT cl.lesson_id) as lesson_count
            FROM classes c
            LEFT JOIN class_students cs ON c.id = cs.class_id
            LEFT JOIN class_lessons cl ON c.id = cl.class_id
            WHERE c.teacher_id = %s
            GROUP BY c.id, c.name, c.description, c.teacher_id
            ORDER BY c.name
        """, (teacher_id,))
        
        classes = cursor.fetchall()
        
        # Para cada clase, obtener los estudiantes
        for class_data in classes:
            cursor.execute("""
                SELECT 
                    u.id,
                    u.username,
                    u.full_name,
                    COUNT(DISTINCT sp.lesson_id) as completed_lessons,
                    COALESCE(SUM(sp.score), 0) as total_score
                FROM class_students cs
                JOIN users u ON cs.student_id = u.id
                LEFT JOIN student_progress sp ON u.id = sp.student_id AND sp.completed = 1
                WHERE cs.class_id = %s
                GROUP BY u.id, u.username, u.full_name
            """, (class_data['id'],))
            
            class_data['students'] = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({"classes": classes})
        
    except Exception as e:
        try:
            cursor.close()
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

@teacher_bp.route("/api/teacher/student/<int:student_id>")
def api_student_detail(student_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE id=%s", (student_id,))
        student = cursor.fetchone()
        if not student:
            cursor.close()
            conn.close()
            return jsonify({"error": "Student not found"}), 404

        cursor.execute("""
            SELECT s.lesson_id, l.title, s.score, s.started_at, s.finished_at,
                   COUNT(a.id) as total_attempts,
                   IFNULL(SUM(a.correct),0) as correct_attempts
            FROM sessions s
            LEFT JOIN lessons l ON s.lesson_id = l.id
            LEFT JOIN attempts a ON s.id = a.session_id
            WHERE s.user_id = %s
            GROUP BY s.lesson_id
            ORDER BY s.started_at DESC
        """, (student_id,))
        progress = cursor.fetchall()

        progress_list = []
        for p in progress:
            started_at = p["started_at"]
            finished_at = p["finished_at"]
            if started_at:
                try:
                    started_at = time.strftime("%Y-%m-%d %H:%M", time.localtime(started_at/1000))
                except:
                    started_at = str(started_at)
            if finished_at:
                try:
                    finished_at = time.strftime("%Y-%m-%d %H:%M", time.localtime(finished_at/1000))
                except:
                    finished_at = str(finished_at)
            progress_list.append({
                "lesson_id": p["lesson_id"],
                "title": p["title"],
                "score": p["score"],
                "started_at": started_at,
                "finished_at": finished_at,
                "total_attempts": p["total_attempts"],
                "correct_attempts": p["correct_attempts"]
            })

        cursor.execute("""
            SELECT 
                COUNT(DISTINCT s.lesson_id) as lessons_attempted,
                COUNT(DISTINCT CASE WHEN s.finished_at IS NOT NULL THEN s.lesson_id END) as lessons_completed,
                COUNT(a.id) as total_attempts,
                IFNULL(SUM(a.correct),0) as correct_attempts,
                ROUND(IFNULL(SUM(a.correct) * 100.0 / NULLIF(COUNT(a.id),0),0),2) as overall_accuracy
            FROM sessions s
            LEFT JOIN attempts a ON s.id = a.session_id
            WHERE s.user_id = %s
        """, (student_id,))
        overall = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "student": {
                "id": student["id"],
                "full_name": student["full_name"],
                "username": student["username"]
            },
            "progress": progress_list,
            "overall": overall or {}
        })

    except Exception as e:
        try:
            cursor.close()
        except:
            pass
        try:
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

@teacher_bp.route("/api/teacher/lessons", methods=["GET", "POST"])
def api_lessons_list():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    # GET - Listar lecciones
    if request.method == "GET":
        try:
            cursor = conn.cursor(dictionary=True)
            
            # Query corregido - compatible con MySQL
            cursor.execute("""
                SELECT 
                    l.id,
                    l.title,
                    l.description,
                    l.difficulty,
                    l.order_index,
                    l.created_at,
                    l.active,
                    COUNT(ls.id) as step_count 
                FROM lessons l 
                LEFT JOIN lesson_steps ls ON l.id = ls.lesson_id 
                GROUP BY l.id, l.title, l.description, l.difficulty, l.order_index, l.created_at, l.active
                ORDER BY l.order_index, l.created_at DESC
            """)
            lessons = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify({"lessons": lessons})
        except Exception as e:
            try:
                cursor.close()
            except:
                pass
            try:
                conn.close()
            except:
                pass
            return jsonify({"error": str(e)}), 500
    
    # POST - Crear nueva lección con sus pasos
    if request.method == "POST":
        try:
            data = request.get_json()
            
            # Validar datos requeridos
            title = data.get("title", "").strip()
            description = data.get("description", "").strip()
            difficulty = data.get("difficulty", "beginner")
            order_index = data.get("order_index", 0)
            steps = data.get("steps", [])
            
            if not title:
                return jsonify({"error": "El título es requerido"}), 400
            
            if len(steps) == 0:
                return jsonify({"error": "Debes agregar al menos un paso a la lección"}), 400
            
            # Generar ID único para la lección (8 caracteres alfanuméricos)
            lesson_id = str(uuid.uuid4()).replace('-', '')[:8]
            
            cursor = conn.cursor()
            
            # Verificar si las columnas existen antes de insertar
            cursor.execute("SHOW COLUMNS FROM lessons LIKE 'active'")
            has_active = cursor.fetchone() is not None
            
            cursor.execute("SHOW COLUMNS FROM lessons LIKE 'difficulty'")
            has_difficulty = cursor.fetchone() is not None
            
            cursor.execute("SHOW COLUMNS FROM lessons LIKE 'order_index'")
            has_order_index = cursor.fetchone() is not None
            
            # Crear la lección con campos disponibles
            if has_active and has_difficulty and has_order_index:
                cursor.execute("""
                    INSERT INTO lessons (id, title, description, difficulty, order_index, active)
                    VALUES (%s, %s, %s, %s, %s, 1)
                """, (lesson_id, title, description, difficulty, order_index))
            else:
                # Fallback para base de datos no migrada
                cursor.execute("""
                    INSERT INTO lessons (id, title, description)
                    VALUES (%s, %s, %s)
                """, (lesson_id, title, description))
            
            # Crear los pasos de la lección
            for idx, step in enumerate(steps):
                step_type = step.get("type", "input")  # input, select, match
                target = step.get("target", "").strip()  # La respuesta correcta
                prompt = step.get("prompt", "").strip()  # La pregunta/instrucción
                hint = step.get("hint", "").strip()  # Pista opcional
                max_attempts = step.get("max_attempts", 3)
                
                if not target or not prompt:
                    conn.rollback()
                    cursor.close()
                    conn.close()
                    return jsonify({"error": f"El paso {idx+1} necesita 'target' y 'prompt'"}), 400
                
                cursor.execute("""
                    INSERT INTO lesson_steps 
                    (lesson_id, step_index, type, target, prompt, hint, max_attempts)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (lesson_id, idx, step_type, target, prompt, hint, max_attempts))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return jsonify({
                "message": "Lección creada exitosamente",
                "lesson_id": lesson_id,
                "title": title,
                "steps_created": len(steps)
            }), 201
            
        except Exception as e:
            try:
                conn.rollback()
            except:
                pass
            try:
                cursor.close()
            except:
                pass
            try:
                conn.close()
            except:
                pass
            return jsonify({"error": str(e)}), 500

@teacher_bp.route("/api/teacher/lesson/<lesson_id>", methods=["GET", "PUT", "DELETE"])
def api_lesson_detail(lesson_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    # GET - Obtener detalles de una lección
    if request.method == "GET":
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM lessons WHERE id=%s", (lesson_id,))
            lesson = cursor.fetchone()
            if not lesson:
                cursor.close()
                conn.close()
                return jsonify({"error": "Lesson not found"}), 404
            cursor.execute("SELECT * FROM lesson_steps WHERE lesson_id=%s ORDER BY step_index", (lesson_id,))
            steps = cursor.fetchall()
            cursor.execute("""
                SELECT u.full_name, s.score, s.finished_at,
                       COUNT(a.id) as total_attempts,
                       IFNULL(SUM(a.correct),0) as correct_attempts
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN attempts a ON s.id = a.session_id
                WHERE s.lesson_id = %s
                GROUP BY s.user_id
            """, (lesson_id,))
            performance = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify({
                "lesson": lesson,
                "steps": steps,
                "performance": performance
            })
        except Exception as e:
            try:
                cursor.close()
            except:
                pass
            try:
                conn.close()
            except:
                pass
            return jsonify({"error": str(e)}), 500
    
    # PUT - Actualizar lección existente
    if request.method == "PUT":
        try:
            data = request.get_json()
            cursor = conn.cursor()
            
            # Verificar que la lección existe
            cursor.execute("SELECT id FROM lessons WHERE id=%s", (lesson_id,))
            if not cursor.fetchone():
                cursor.close()
                conn.close()
                return jsonify({"error": "Lesson not found"}), 404
            
            # Actualizar lección
            title = data.get("title")
            description = data.get("description")
            difficulty = data.get("difficulty")
            order_index = data.get("order_index")
            
            if title:
                cursor.execute("""
                    UPDATE lessons 
                    SET title=%s, description=%s, difficulty=%s, order_index=%s
                    WHERE id=%s
                """, (title, description, difficulty, order_index, lesson_id))
            
            # Si se envían pasos nuevos, actualizar
            if "steps" in data:
                # Eliminar pasos anteriores
                cursor.execute("DELETE FROM lesson_steps WHERE lesson_id=%s", (lesson_id,))
                
                # Insertar nuevos pasos
                steps = data.get("steps", [])
                for idx, step in enumerate(steps):
                    cursor.execute("""
                        INSERT INTO lesson_steps 
                        (lesson_id, step_index, type, target, prompt, hint, max_attempts)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (
                        lesson_id, 
                        idx, 
                        step.get("type", "input"),
                        step.get("target", ""),
                        step.get("prompt", ""),
                        step.get("hint", ""),
                        step.get("max_attempts", 3)
                    ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return jsonify({"message": "Lección actualizada exitosamente"}), 200
            
        except Exception as e:
            try:
                conn.rollback()
            except:
                pass
            try:
                cursor.close()
            except:
                pass
            try:
                conn.close()
            except:
                pass
            return jsonify({"error": str(e)}), 500
    
    # DELETE - Eliminar lección (soft delete)
    if request.method == "DELETE":
        try:
            cursor = conn.cursor()
            cursor.execute("UPDATE lessons SET active=0 WHERE id=%s", (lesson_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Lección eliminada exitosamente"}), 200
        except Exception as e:
            try:
                cursor.close()
            except:
                pass
            try:
                conn.close()
            except:
                pass
            return jsonify({"error": str(e)}), 500

@teacher_bp.route("/api/teacher/lesson/<lesson_id>/assign-to-class", methods=["POST"])
def api_assign_lesson_to_class(lesson_id):
    """Asignar una lección a una clase específica"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.get_json()
        class_id = data.get("class_id")
        due_date = data.get("due_date")  # Opcional
        
        if not class_id:
            return jsonify({"error": "class_id es requerido"}), 400
        
        cursor = conn.cursor()
        
        # Verificar que la lección existe
        cursor.execute("SELECT id FROM lessons WHERE id=%s", (lesson_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "Lección no encontrada"}), 404
        
        # Verificar que la clase existe
        cursor.execute("SELECT id FROM classes WHERE id=%s", (class_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "Clase no encontrada"}), 404
        
        # Asignar lección a clase
        cursor.execute("""
            INSERT INTO class_lessons (class_id, lesson_id, due_date)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE due_date=VALUES(due_date), active=1
        """, (class_id, lesson_id, due_date))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Lección asignada a la clase exitosamente"}), 201
        
    except Exception as e:
        try:
            conn.rollback()
        except:
            pass
        try:
            cursor.close()
        except:
            pass
        try:
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500
