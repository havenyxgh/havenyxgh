/* HAVENYX — Basic frontend shell (static demo) 🖤✨
   - Copy these three files into a folder and open index.html
   - This is a static/stubbed UI for quick prototyping.
   - Real auth, persistence, and admin security must be implemented server-side.
*/

const sampleProducts = [
  {
    id: 'p1',
    division: 'onyx',
    name: 'Onyx Satin Dress',
    price: 120,
    oldPrice: 160,
    badge: '-25%',
    emoji: '👗',
    colors: ['Black','Burgundy'],
    sizes: ['S','M','L']
  },
  {
    id: 'p2',
    division: 'onyx',
    name: 'Gold Bar Necklace',
    price: 49,
    oldPrice: null,
    badge: null,
    emoji: '📿',
    colors: ['Gold'],
    sizes: []
  },
  {
    id: 'p3',
    division: 'haus',
    name: 'Wireless Charger Pro',
    price: 34,
    oldPrice: 49,
    badge: '-30%',
    emoji: '🔌',
    colors: ['Black','White'],
    sizes: []
  },
  {
    id: 'p4',
    division: 'haus',
    name: 'Mini Smart Lamp',
    price: 22,
    oldPrice: null,
    badge: null,
    emoji: '💡',
    colors: ['Warm','Cool'],
    sizes: []
  }
];

// simple state
const state = {
  division: 'onyx',
  wishlist: [],
  cart: []
};

// ui refs
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const btnOpenSidebar = document.getElementById('btnOpenSidebar');
const btnCloseSidebar = document.getElementById('btnCloseSidebar');
const segButtons = Array.from(document.querySelectorAll('.seg-seg'));
const productsGrid = document.getElementById('productsGrid');
const activeDivisionLabel = document.getElementById('activeDivisionLabel');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const yearSpan = document.getElementById('year');

yearSpan.textContent = new Date().getFullYear();

// sidebar controls
btnOpenSidebar.addEventListener('click', () => {
  sidebar.classList.add('open');
  overlay.classList.remove('hidden');
});
btnCloseSidebar.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
function closeSidebar(){
  sidebar.classList.remove('open');
  overlay.classList.add('hidden');
}

// segmented controls
segButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    segButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.division = btn.dataset.division;
    renderProducts();
  });
});

// hero quick-card routing
document.querySelectorAll('.hero-card').forEach(b=>{
  b.addEventListener('click', ()=> {
    const division = b.dataset.division;
    state.division = division;
    segButtons.forEach(s => s.classList.toggle('active', s.dataset.division === division));
    renderProducts();
    window.scrollTo({top:160,behavior:'smooth'});
  });
});

// render products
function renderProducts(){
  activeDivisionLabel.textContent = state.division === 'onyx' ? 'Onyx Touch' : 'Haven Haus';
  productsGrid.innerHTML = '';
  const filtered = sampleProducts.filter(p => p.division === state.division);
  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="img" title="${p.name}">${p.emoji}</div>
      <div class="meta">
        <div>
          <div class="name">${p.name}</div>
          <div class="sub">${p.colors.join(', ')}</div>
        </div>
        <div style="text-align:right">
          ${p.oldPrice ? `<div class="price-old">$${p.oldPrice}</div>` : ''}
          <div class="price">$${p.price}</div>
          ${p.badge ? `<div class="badge">${p.badge}</div>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn preview" data-id="${p.id}">Preview 👀</button>
        <button class="btn wishlist" data-id="${p.id}">♡ Save</button>
        <button class="btn addcart" data-id="${p.id}">+ Cart</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });

  // attach actions
  document.querySelectorAll('.btn.preview').forEach(b => {
    b.addEventListener('click', (e) => openProductPreview(e.target.dataset.id));
  });
  document.querySelectorAll('.btn.wishlist').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      toggleWishlist(id);
    });
  });
  document.querySelectorAll('.btn.addcart').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      addToCart(id);
    });
  });
}

// simple wishlist toggle
function toggleWishlist(id){
  const exists = state.wishlist.includes(id);
  if(!exists) state.wishlist.push(id);
  else state.wishlist = state.wishlist.filter(x=>x!==id);
  showToast(!exists ? 'Added to wishlist ✨' : 'Removed from wishlist');
}

// add to cart (opens quick modal for selection)
function addToCart(id){
  const product = sampleProducts.find(p=>p.id===id);
  openModal(`
    <h3>${product.name} ${product.emoji}</h3>
    <p>Price: $${product.price} ${product.oldPrice ? `<span class="price-old">$${product.oldPrice}</span>` : ''}</p>
    ${product.colors.length ? `<label>Color: <select id="selColor">${product.colors.map(c=>`<option>${c}</option>`).join('')}</select></label>` : ''}
    ${product.sizes.length ? `<label>Size: <select id="selSize">${product.sizes.map(s=>`<option>${s}</option>`).join('')}</select></label>` : ''}
    <label>Qty: <input id="qty" type="number" value="1" min="1" style="width:72px;padding:6px;border-radius:8px;background:#0b0b0b;border:1px solid rgba(255,255,255,0.03);color:var(--white)"></label>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button id="confirmAdd" class="btn">Add to cart 🛒</button>
      <button id="closeModal" class="btn">Cancel</button>
    </div>
  `);

  document.getElementById('confirmAdd').addEventListener('click', () => {
    const qty = parseInt(document.getElementById('qty').value || '1',10);
    state.cart.push({id:product.id, qty});
    closeModal();
    showToast('Added to cart 🛒');
  });
  document.getElementById('closeModal').addEventListener('click', closeModal);
}

// product preview (opens new tab — simulated by opening modal with full info)
function openProductPreview(id){
  const p = sampleProducts.find(x=>x.id===id);
  openModal(`
    <h2>${p.name} ${p.emoji}</h2>
    <div style="display:flex;gap:12px;align-items:center">
      <div style="flex:1;height:220px;border-radius:10px;background:linear-gradient(135deg,#111,#0e0e0e);display:flex;align-items:center;justify-content:center;font-size:64px">${p.emoji}</div>
      <div style="flex:1">
        <p><strong>Price:</strong> $${p.price} ${p.oldPrice ? `<span class="price-old">$${p.oldPrice}</span>` : ''}</p>
        <p><strong>Colors:</strong> ${p.colors.join(', ')}</p>
        <p><strong>Sizes:</strong> ${p.sizes.join(', ') || '—'}</p>
        <p style="color:var(--muted)">Similar items below (not real)</p>
        <div style="margin-top:12px">
          <button id="previewAdd" class="btn">+ Add to cart</button>
          <button id="previewWish" class="btn">♡ Save</button>
        </div>
      </div>
    </div>
  `);

  document.getElementById('previewAdd').addEventListener('click', ()=> {
    state.cart.push({id:p.id, qty:1});
    closeModal();
    showToast('Added to cart 🛒');
  });
  document.getElementById('previewWish').addEventListener('click', ()=> {
    toggleWishlist(p.id);
    closeModal();
  });
}

// modal helpers
function openModal(html){
  modalContent.innerHTML = html;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
}
function closeModal(){
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  modalContent.innerHTML = '';
}
modalClose.addEventListener('click', closeModal);

// toast (tiny)
function showToast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position='fixed';t.style.bottom='22px';t.style.right='22px';
  t.style.background='linear-gradient(90deg, rgba(212,175,55,0.12), rgba(212,175,55,0.05))';
  t.style.border='1px solid rgba(212,175,55,0.12)';
  t.style.padding='10px 14px';t.style.borderRadius='999px';t.style.zIndex=9999;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

// simple cart modal
document.getElementById('cartBtn').addEventListener('click', ()=> {
  const items = state.cart.map(ci => {
    const p = sampleProducts.find(x=>x.id===ci.id);
    return `<div style="display:flex;justify-content:space-between;padding:8px 0">
      <div>${p.name} × ${ci.qty}</div>
      <div>$${p.price * ci.qty}</div>
    </div>`;
  }).join('') || '<em>Your cart is empty</em>';

  const total = state.cart.reduce((sum,ci)=> {
    const p = sampleProducts.find(x=>x.id===ci.id);
    return sum + (p.price * ci.qty);
  },0);

  openModal(`<h3>Your Cart 🛒</h3><div>${items}</div><hr><div style="display:flex;justify-content:space-between"><strong>Total</strong><strong>$${total}</strong></div><div style="margin-top:12px"><button id="checkoutBtn" class="btn">Checkout</button></div>`);
  document.getElementById('checkoutBtn')?.addEventListener('click', ()=> {
    closeModal();
    showToast('Checkout not implemented in demo — this is a static prototype 🙂');
  });
});

// wishlist modal
document.getElementById('wishlistBtn').addEventListener('click', ()=> {
  const items = state.wishlist.map(id => {
    const p = sampleProducts.find(x=>x.id===id);
    return `<div style="display:flex;justify-content:space-between;padding:8px 0">
      <div>${p.name}</div>
      <div>
        <button class="remove-wish" data-id="${id}">Remove</button>
        <button class="wish-add" data-id="${id}">Add to Cart</button>
      </div>
    </div>`;
  }).join('') || '<em>Your wishlist is empty</em>';

  openModal(`<h3>Wishlist ✨</h3><div>${items}</div>`);
  document.querySelectorAll('.remove-wish').forEach(b=>{
    b.addEventListener('click', (e)=> {
      const id = e.target.dataset.id;
      state.wishlist = state.wishlist.filter(x=>x!==id);
      closeModal();
      showToast('Removed from wishlist');
    });
  });
  document.querySelectorAll('.wish-add').forEach(b=>{
    b.addEventListener('click', (e)=> {
      const id = e.target.dataset.id;
      state.cart.push({id, qty:1});
      closeModal();
      showToast('Added to cart 🛒');
    });
  });
});

// initial render
renderProducts();
