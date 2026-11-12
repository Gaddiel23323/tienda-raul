let productosCatalogo = [];
let carrito = [];

// 1. Al cargar la página, pedimos los productos al backend en Python
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    // Evento para abrir/cerrar menú hamburguesa en celular
    document.getElementById('btn-hamburger').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('abierto');
    });
});

async function cargarProductos() {
    const respuesta = await fetch('/api/productos');
    productosCatalogo = await respuesta.json();
    
    const contenedor = document.getElementById('lista-productos');
    contenedor.innerHTML = '';

    productosCatalogo.forEach(prod => {
        contenedor.innerHTML += `
            <div class="producto-card">
                <img src="${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p class="precio">S/ ${prod.precio.toFixed(2)}</p>
                <div class="control-cantidad">
                    <label>Cant:</label>
                    <input type="number" id="cant-${prod.id}" value="1" min="1" max="50">
                </div>
                <button class="btn-agregar" onclick="agregarAlCarrito(${prod.id})">
                    Agregar al carrito
                </button>
            </div>
        `;
    });
}

// 2. Cambiar entre pestañas (Inicio, Carrito, Pago)
function mostrarVista(nombreVista) {
    document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
    document.getElementById(`vista-${nombreVista}`).classList.add('activa');
    
    // Cierra el menú hamburguesa en móvil al hacer clic
    document.getElementById('nav-links').classList.remove('abierto');

    if (nombreVista === 'carrito') renderizarCarrito();
}

// 3. Agregar productos al carrito
function agregarAlCarrito(idProducto) {
    const producto = productosCatalogo.find(p => p.id === idProducto);
    const cantidad = parseInt(document.getElementById(`cant-${idProducto}`).value);

    if (cantidad <= 0 || isNaN(cantidad)) return;

    const itemExistente = carrito.find(item => item.id === idProducto);
    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }

    actualizarContador();
    alert(`Se agregó ${cantidad}x ${producto.nombre} al carrito.`);
}

function actualizarContador() {
    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    document.getElementById('contador-carrito').innerText = totalItems;
}

// 4. Dibujar la lista del carrito
function renderizarCarrito() {
    const contenedor = document.getElementById('contenido-carrito');
    const acciones = document.getElementById('acciones-carrito');

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p>Tu carrito está vacío. ¡Ve a Inicio para agregar abarrotes!</p>';
        acciones.style.display = 'none';
        return;
    }

    contenedor.innerHTML = '';
    let subtotal = 0;

    carrito.forEach((item, index) => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;

        contenedor.innerHTML += `
            <div class="item-carrito">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <small>S/ ${item.precio.toFixed(2)} x ${item.cantidad} unid.</small>
                </div>
                <div>
                    <strong>S/ ${totalItem.toFixed(2)}</strong>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">X</button>
                </div>
            </div>
        `;
    });

    document.getElementById('carrito-subtotal').innerText = subtotal.toFixed(2);
    acciones.style.display = 'block';
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarContador();
    renderizarCarrito();
}

// 5. Ir a la vista de Pago y calcular Factura + IGV
function irAPagar() {
    mostrarVista('pago');
    const detalleFactura = document.getElementById('detalle-factura');
    detalleFactura.innerHTML = '';

    let subtotal = 0;

    carrito.forEach(item => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;
        detalleFactura.innerHTML += `
            <p><span>${item.cantidad}x ${item.nombre}</span> <span>S/ ${totalItem.toFixed(2)}</span></p>
        `;
    });

    const igv = subtotal * 0.18;
    const totalFinal = subtotal + igv;

    document.getElementById('fac-subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('fac-igv').innerText = igv.toFixed(2);
    document.getElementById('fac-total').innerText = totalFinal.toFixed(2);
}

// 6. Enviar formulario de compra al servidor Python
document.getElementById('form-pago').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const datosPedido = {
        nombre: document.getElementById('nombre').value,
        celular: document.getElementById('celular').value,
        correo: document.getElementById('correo').value,
        tarjeta: document.getElementById('tipo-tarjeta').value,
        total: parseFloat(document.getElementById('fac-total').innerText)
    };

    const respuesta = await fetch('/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosPedido)
    });

    if (respuesta.ok) {
        const resultado = await respuesta.json();
        alert(`¡Gracias por tu compra! Tu número de pedido es #${resultado.pedido_id}`);
        carrito = []; // Vaciamos carrito
        actualizarContador();
        document.getElementById('form-pago').reset();
        mostrarVista('inicio');
    }
});