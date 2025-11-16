const socket = io();

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderProducts(products) {
  const container = document.getElementById('productsList');
  if (!container) return;
  if (!Array.isArray(products) || products.length === 0) {
    container.innerHTML = '<p>No hay productos</p>';
    return;
  }

  container.innerHTML = products.map(p => {
    return `
      <div class="product" data-id="${escapeHtml(p.id)}">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description || '')}</p>
        <p><strong>Precio:</strong> $${escapeHtml(p.price)}</p>
        <p><strong>Stock:</strong> ${escapeHtml(p.stock)}</p>
        <p><strong>Categoría:</strong> ${escapeHtml(p.category || '')}</p>
        <button class="delete-btn" data-id="${escapeHtml(p.id)}">Eliminar</button>
      </div>
    `;
  }).join('');

  // attach delete handlers
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (!id) return;
      socket.emit('deleteProduct', id);
    });
  });
}

// recibir actualizaciones de productos
socket.on('updateProducts', (products) => {
  renderProducts(products);
});

socket.on('errorCreate', (msg) => {
  alert('Error al crear producto: ' + msg);
});

socket.on('errorDelete', (msg) => {
  alert('Error al eliminar producto: ' + msg);
});

// formulario para crear producto vía websocket
const form = document.getElementById('createProductForm');
if (form) {
  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formData = new FormData(form);
    const product = {
      title: formData.get('title'),
      description: formData.get('description'),
      code: formData.get('code'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      category: formData.get('category')
    };

    socket.emit('createProduct', product);
    form.reset();
  });
}

// pedir la lista inicial por si no llegó en el momento de conexión
socket.emit('requestProducts');
