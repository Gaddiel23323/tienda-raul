import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
DB_NAME = "tienda.db"

# Función para conectar a la base de datos SQLite
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # Permite acceder a las columnas por nombre
    return conn

# Inicializar tablas y datos de prueba
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tabla de productos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            imagen TEXT NOT NULL
        )
    ''')
    
    # Tabla de pedidos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_nombre TEXT NOT NULL,
            celular TEXT NOT NULL,
            correo TEXT NOT NULL,
            tipo_tarjeta TEXT NOT NULL,
            total REAL NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insertar productos de ejemplo solo si la tabla está vacía
    cursor.execute('SELECT COUNT(*) FROM productos')
    if cursor.fetchone()[0] == 0:
        productos_iniciales = [
            ("Arroz Extra Costeño 5kg", 22.50, "https://placehold.co/300x200/e2e8f0/1e293b?text=Arroz+5kg"),
            ("Aceite Vegetal Primor 1L", 11.80, "https://placehold.co/300x200/fef08a/854d0e?text=Aceite+1L"),
            ("Azúcar Rubia Cartavio 1kg", 4.50, "https://placehold.co/300x200/fed7aa/9a3412?text=Azucar+1kg"),
            ("Leche Evaporada Gloria (Pack x6)", 24.00, "https://placehold.co/300x200/bfdbfe/1e3a8a?text=Leche+Pack"),
            ("Fideos Spaghetti Don Vittorio 500g", 3.20, "https://placehold.co/300x200/fde68a/78350f?text=Fideos+500g"),
            ("Atún Filete Florida 170g", 6.50, "https://placehold.co/300x200/fecaca/7f1d1d?text=Atun+170g")
        ]
        cursor.executemany('INSERT INTO productos (nombre, precio, imagen) VALUES (?, ?, ?)', productos_iniciales)
    
    conn.commit()
    conn.close()

# Ruta principal: Carga la página HTML
@app.route('/')
def index():
    return render_template('index.html')

# API: Devuelve la lista de productos en formato JSON para que JS los dibuje
@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    conn = get_db_connection()
    productos = conn.execute('SELECT * FROM productos').fetchall()
    conn.close()
    return jsonify([dict(row) for row in productos])

# API: Recibe los datos del formulario y guarda la compra en SQLite
@app.route('/api/comprar', methods=['POST'])
def procesar_compra():
    datos = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO pedidos (cliente_nombre, celular, correo, tipo_tarjeta, total)
        VALUES (?, ?, ?, ?, ?)
    ''', (datos['nombre'], datos['celular'], datos['correo'], datos['tarjeta'], datos['total']))
    
    pedido_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({"mensaje": "Compra registrada con éxito", "pedido_id": pedido_id}), 201

if __name__ == '__main__':
    init_db()  # Prepara la BD antes de arrancar
    app.run(debug=True)