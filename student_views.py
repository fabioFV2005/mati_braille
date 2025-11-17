from flask import Blueprint, request, jsonify
from db import get_db_connection
import uuid
from datetime import datetime

student_bp = Blueprint("student_bp", __name__)

@student_bp.route("/api/student/lessons/<int:student_id>", methods=["GET"])
def get_student_lessons(student_id):
    """Obtener lecciones disponibles para el estudiante"""
    conn = get_db_connection()
    if not conn:
        print("ERROR: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Intentar obtener lecciones asignadas a las clases del estudiante
        # Intentar obtener lecciones asignadas a las clases del estudiante
        cursor.execute("""
            SELECT DISTINCT
                l.id,
                l.title,
                l.description,
                l.difficulty,
                l.order_index,
                l.created_at,
                COUNT(ls.id) as total_steps,
                COALESCE(sp.completed, 0) as completed,
                COALESCE(sp.score, 0) as score
            FROM lessons l
            LEFT JOIN lesson_steps ls ON l.id = ls.lesson_id
            LEFT JOIN class_lessons cl ON l.id = cl.lesson_id
            LEFT JOIN class_students cs ON cl.class_id = cs.class_id
            LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.student_id = %s
            WHERE cs.student_id = %s AND l.active = 1
            GROUP BY l.id, l.title, l.description, l.difficulty, l.order_index, l.created_at, sp.completed, sp.score
            ORDER BY l.order_index, l.created_at
        """, (student_id, student_id))
        
        lessons = cursor.fetchall()
        print(f"Lecciones encontradas (asignadas): {len(lessons)}")
        
        # Si no hay lecciones asignadas, mostrar todas las lecciones activas
        if not lessons or len(lessons) == 0:
            print("No hay lecciones asignadas, mostrando todas las disponibles")
            cursor.execute("""
                SELECT 
                    l.id,
                    l.title,
                    l.description,
                    l.difficulty,
                    l.order_index,
                    l.created_at,
                    COUNT(ls.id) as total_steps,
                    COALESCE(sp.completed, 0) as completed,
                    COALESCE(sp.score, 0) as score
                FROM lessons l
                LEFT JOIN lesson_steps ls ON l.id = ls.lesson_id
                LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.student_id = %s
                WHERE l.active = 1
                GROUP BY l.id, l.title, l.description, l.difficulty, l.order_index, l.created_at, sp.completed, sp.score
                ORDER BY l.order_index, l.created_at
            """, (student_id,))
            
            lessons = cursor.fetchall()
            print(f"Lecciones encontradas (todas): {len(lessons)}")
        
        cursor.close()
        conn.close()
        
        print(f"Retornando {len(lessons)} lecciones")
        return jsonify({"lessons": lessons})
        
    except Exception as e:
        print(f"ERROR en get_student_lessons: {str(e)}")
        import traceback
        traceback.print_exc()
        try:
            cursor.close()
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

@student_bp.route("/api/student/start-session", methods=["POST"])
def start_session():
    """Iniciar una nueva sesión de lección"""
    data = request.get_json()
    student_id = data.get("student_id")
    lesson_id = data.get("lesson_id")
    
    if not student_id or not lesson_id:
        return jsonify({"error": "student_id and lesson_id required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si ya existe una sesión activa
        cursor.execute("""
            SELECT id FROM sessions 
            WHERE user_id = %s AND lesson_id = %s AND finished_at IS NULL
            ORDER BY started_at DESC LIMIT 1
        """, (student_id, lesson_id))
        
        existing = cursor.fetchone()
        
        if existing:
            session_id = existing["id"]
        else:
            # Crear nueva sesión
            session_id = str(uuid.uuid4()).replace('-', '')[:16]
            cursor.execute("""
                INSERT INTO sessions (id, lesson_id, user_id, started_at, score)
                VALUES (%s, %s, %s, NOW(), 0)
            """, (session_id, lesson_id, student_id))
            conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"session_id": session_id})
        
    except Exception as e:
        try:
            conn.rollback()
            cursor.close()
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

@student_bp.route("/api/session_prompt/<session_id>")
def api_session_prompt(session_id):
    """Obtener el siguiente prompt/paso de la sesión"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Obtener información de la sesión
        cursor.execute("""
            SELECT s.*, l.title as lesson_title
            FROM sessions s
            JOIN lessons l ON s.lesson_id = l.id
            WHERE s.id = %s
        """, (session_id,))
        
        session = cursor.fetchone()
        
        if not session:
            cursor.close()
            conn.close()
            return jsonify({"error": "Session not found"}), 404
        
        lesson_id = session["lesson_id"]
        
        # Obtener total de pasos de la lección
        cursor.execute("""
            SELECT COUNT(*) as total_steps 
            FROM lesson_steps 
            WHERE lesson_id = %s
        """, (lesson_id,))
        
        total_steps = cursor.fetchone()["total_steps"]
        
        # Contar respuestas correctas para determinar el paso actual
        cursor.execute("""
            SELECT COUNT(*) as correct_count 
            FROM attempts 
            WHERE session_id = %s AND correct = 1
        """, (session_id,))
        
        correct_count = cursor.fetchone()["correct_count"]
        
        # Obtener el paso actual
        cursor.execute("""
            SELECT * FROM lesson_steps 
            WHERE lesson_id = %s AND step_index = %s
        """, (lesson_id, correct_count))
        
        step = cursor.fetchone()
        
        if not step:
            # La lección ha terminado
            cursor.execute("""
                UPDATE sessions 
                SET finished_at = NOW() 
                WHERE id = %s AND finished_at IS NULL
            """, (session_id,))
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return jsonify({
                "finished": True,
                "score": session.get("score", 0),
                "user_id": session["user_id"]
            })
        
        # Contar intentos en este paso
        cursor.execute("""
            SELECT COUNT(*) as attempt_count 
            FROM attempts 
            WHERE session_id = %s AND step_index = %s
        """, (session_id, correct_count))
        
        attempts = cursor.fetchone()["attempt_count"]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "finished": False,
            "prompt": step["prompt"],
            "target": step["target"],
            "hint": step.get("hint"),
            "step_index": step["step_index"],
            "max_attempts": step.get("max_attempts", 3),
            "attempts": attempts,
            "score": session.get("score", 0),
            "user_id": session["user_id"],
            "total_steps": total_steps
        })
        
    except Exception as e:
        try:
            cursor.close()
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

@student_bp.route("/api/submit/<session_id>", methods=["POST"])
def api_submit(session_id):
    """Enviar respuesta a un paso"""
    data = request.json or {}
    answer = (data.get("answer") or "").strip().upper()
    
    if not answer:
        return jsonify({"error": "answer required"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Obtener sesión
        cursor.execute("SELECT * FROM sessions WHERE id = %s", (session_id,))
        session = cursor.fetchone()
        
        if not session:
            cursor.close()
            conn.close()
            return jsonify({"error": "session not found"}), 404
        
        lesson_id = session["lesson_id"]
        user_id = session["user_id"]
        
        # Contar correctas para saber el paso actual
        cursor.execute("""
            SELECT COUNT(*) as correct_count 
            FROM attempts 
            WHERE session_id = %s AND correct = 1
        """, (session_id,))
        
        correct_count = cursor.fetchone()["correct_count"]
        
        # Obtener el paso actual
        cursor.execute("""
            SELECT * FROM lesson_steps 
            WHERE lesson_id = %s AND step_index = %s
        """, (lesson_id, correct_count))
        
        step = cursor.fetchone()
        
        if not step:
            cursor.close()
            conn.close()
            return jsonify({"finished": True})
        
        target = (step["target"] or "").upper()
        
        # Contar intentos previos en este paso
        cursor.execute("""
            SELECT COUNT(*) as attempt_count 
            FROM attempts 
            WHERE session_id = %s AND step_index = %s
        """, (session_id, correct_count))
        
        prev_attempts = cursor.fetchone()["attempt_count"]
        attempts_now = prev_attempts + 1
        
        # Verificar respuesta
        is_correct = (answer == target)
        
        # Registrar intento
        cursor.execute("""
            INSERT INTO attempts 
            (session_id, lesson_id, user_id, step_index, answer, correct, attempts, ts)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """, (session_id, lesson_id, user_id, correct_count, answer, 1 if is_correct else 0, attempts_now))
        
        # Si es correcta, sumar punto
        if is_correct:
            cursor.execute("""
                UPDATE sessions 
                SET score = score + 1 
                WHERE id = %s
            """, (session_id,))
        
        conn.commit()
        
        result = {
            "correct": is_correct,
            "attempts": attempts_now,
            "max_attempts": step.get("max_attempts", 3)
        }
        
        # Si falló y agotó intentos, dar pista
        if not is_correct and attempts_now >= step.get("max_attempts", 3):
            result["hint"] = step.get("hint") or f"La respuesta correcta es: {target}"
        
        # Si es correcto, verificar si hay más pasos
        if is_correct:
            cursor.execute("""
                SELECT * FROM lesson_steps 
                WHERE lesson_id = %s AND step_index = %s
            """, (lesson_id, correct_count + 1))
            
            next_step = cursor.fetchone()
            
            if not next_step:
                # Lección completada
                cursor.execute("""
                    UPDATE sessions 
                    SET finished_at = NOW() 
                    WHERE id = %s
                """, (session_id,))
                conn.commit()
                result["finished"] = True
        
        cursor.close()
        conn.close()
        
        return jsonify(result)
        
    except Exception as e:
        try:
            conn.rollback()
            cursor.close()
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500

@student_bp.route("/api/skip/<session_id>", methods=["POST"])
def api_skip(session_id):
    """Saltar un paso"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM sessions WHERE id = %s", (session_id,))
        session = cursor.fetchone()
        
        if not session:
            cursor.close()
            conn.close()
            return jsonify({"error": "session not found"}), 404
        
        lesson_id = session["lesson_id"]
        user_id = session["user_id"]
        
        # Contar correctas
        cursor.execute("""
            SELECT COUNT(*) as correct_count 
            FROM attempts 
            WHERE session_id = %s AND correct = 1
        """, (session_id,))
        
        correct_count = cursor.fetchone()["correct_count"]
        
        # Registrar intento saltado
        cursor.execute("""
            INSERT INTO attempts 
            (session_id, lesson_id, user_id, step_index, answer, correct, attempts, ts)
            VALUES (%s, %s, %s, %s, '__SKIP__', 0, 1, NOW())
        """, (session_id, lesson_id, user_id, correct_count))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"ok": True})
        
    except Exception as e:
        try:
            conn.rollback()
            cursor.close()
            conn.close()
        except:
            pass
        return jsonify({"error": str(e)}), 500
