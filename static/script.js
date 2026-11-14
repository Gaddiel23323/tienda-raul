let productosCatalogo = [];
let carrito = [];

// Asignamos categorías visuales a los 6 productos de la BD
const categoriasPorId = {
    1: "Granos",
    2: "Aceites",
    3: "Granos",
    4: "Lácteos",
    5: "Conservas",
    6: "Conservas"
};

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    document.getElementById('btn-hamburger').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('abierto');
    });
});

async function cargarProductos() {
    const respuesta = await fetch('/api/productos');
    const datos = await respuesta.json();
    
    productosCatalogo = datos.map(prod => ({
        ...prod,
        categoria: categoriasPorId[prod.id] || "Abarrotes"
    }));

    renderizarProductos(productosCatalogo);
}

function renderizarProductos(lista) {
    const contenedor = document.getElementById('lista-productos');
    document.getElementById('contador-resultados').innerText = `${lista.length} PRODUCTOS ENCONTRADOS`;
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron productos con ese filtro.</p>';
        return;
    }

    lista.forEach(prod => {
        contenedor.innerHTML += `
            <div class="producto-card">
                <div>
                    <span class="tag-categoria">${prod.categoria}</span>
                    <img src="${prod.imagen}" alt="${prod.nombre}">
                    <h3>${prod.nombre}</h3>
                </div>
                <div>
                    <p class="precio">S/ ${prod.precio.toFixed(2)}</p>
                    <div class="control-cantidad">
                        <button type="button" onclick="cambiarCantidad(${prod.id}, -1)">-</button>
                        <input type="number" id="cant-${prod.id}" value="1" min="1" max="50" readonly>
                        <button type="button" onclick="cambiarCantidad(${prod.id}, 1)">+</button>
                    </div>
                    <button class="btn-agregar" onclick="agregarAlCarrito(${prod.id})">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;
    });
}

function cambiarCantidad(idProducto, delta) {
    const input = document.getElementById(`cant-${idProducto}`);
    let valor = parseInt(input.value) + delta;
    if (valor < 1) valor = 1;
    if (valor > 50) valor = 50;
    input.value = valor;
}

function seleccionarCategoria(cat) {
    mostrarVista('inicio');
    const radio = document.querySelector(`input[name="cat"][value="${cat}"]`);
    if (radio) radio.checked = true;
    filtrarProductos();
}

function filtrarProductos() {
    const texto = document.getElementById('input-busqueda').value.toLowerCase();
    const catSeleccionada = document.querySelector('input[name="cat"]:checked').value;

    const filtrados = productosCatalogo.filter(prod => {
        const coincideTexto = prod.nombre.toLowerCase().includes(texto);
        const coincideCat = catSeleccionada === "Todos" || prod.categoria === catSeleccionada;
        return coincideTexto && coincideCat;
    });

    renderizarProductos(filtrados);
}

function mostrarVista(nombreVista) {
    document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
    document.getElementById(`vista-${nombreVista}`).classList.add('activa');
    document.getElementById('nav-links').classList.remove('abierto');

    if (nombreVista === 'carrito') renderizarCarrito();
}

function agregarAlCarrito(idProducto) {
    const producto = productosCatalogo.find(p => p.id === idProducto);
    const cantidad = parseInt(document.getElementById(`cant-${idProducto}`).value);

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

function renderizarCarrito() {
    const contenedor = document.getElementById('contenido-carrito');
    const acciones = document.getElementById('acciones-carrito');

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p>Tu carrito está vacío. ¡Explora nuestras ofertas en Inicio!</p>';
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

document.getElementById('form-pago').addEventListener('submit', async (e) => {
    e.preventDefault();

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
        carrito = [];
        actualizarContador();
        document.getElementById('form-pago').reset();
        mostrarVista('inicio');
    }
});