import mysql.connector
from mysql.connector import Error
import time
import os

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "braille_db")
DB_PORT = int(os.getenv("DB_PORT", 3306))

class CursorWrapper:
    def __init__(self, cursor, conn):
        self._cursor = cursor
        self._conn = conn

    def fetchall(self):
        return self._cursor.fetchall()

    def fetchone(self):
        return self._cursor.fetchone()

    def __iter__(self):
        return iter(self._cursor)

    @property
    def rowcount(self):
        return self._cursor.rowcount

    @property
    def lastrowid(self):
        return self._cursor.lastrowid

    def close(self):
        try:
            self._cursor.close()
        except:
            pass

class DB:
    def __init__(self, conn):
        self.conn = conn

    def execute(self, sql, params=None):
        # Accept queries with '?' placeholders (sqlite style) and convert to %s for MySQL
        if params is None:
            params = ()
        sql_for_mysql = sql.replace('?', '%s')
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute(sql_for_mysql, params)
        return CursorWrapper(cursor, self.conn)

    def commit(self):
        try:
            self.conn.commit()
        except:
            pass

    def close(self):
        try:
            self.conn.close()
        except:
            pass

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT,
            autocommit=False
        )
        return conn
    except Error:
        return None

def get_db():
    conn = get_db_connection()
    if not conn:
        raise RuntimeError("Database connection failed")
    return DB(conn)

def now_ms():
    return int(time.time() * 1000)

def init_db():
    # Test connection
    conn = get_db_connection()
    if conn:
        conn.close()
