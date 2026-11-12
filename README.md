# Tienda Raúl - Sistema Web de Abarrotes

Aplicación web full-stack sencilla para la venta de productos de abarrotes, desarrollada como proyecto de portafolio para demostrar la integración entre frontend, backend en Python y base de datos relacional.

## Características principales
* **Navegación Responsiva:** Menú superior horizontal en escritorio y menú desplegable tipo hamburguesa en dispositivos móviles.
* **Catálogo Dinámico:** Visualización de productos con imagen referencial, precio en soles (S/) y selector de cantidad.
* **Carrito de Compras:** Agregado y eliminación de productos en tiempo real con cálculo automático de subtotales y contador dinámico.
* **Checkout y Facturación:** Vista dividida en dos columnas con formulario de datos del cliente (nombres, celular, correo y tipo de tarjeta) junto a un resumen detallado con cálculo automático del **IGV (18%)**.
* **Persistencia de Datos:** Registro de productos y almacenamiento de pedidos confirmados en base de datos SQLite.

## Tecnologías utilizadas
* **Frontend:** HTML5, CSS3 (Grid, Flexbox y Media Queries), JavaScript (Vanilla ES6+ con Fetch API).
* **Backend:** Python 3 con el microframework **Flask**.
* **Base de Datos:** **SQLite3**.

## Cómo ejecutar el proyecto en local

1. Clona este repositorio en tu computadora:
   ```bash
    git clone https://github.com/Gaddiel23323/tienda-raul.git
