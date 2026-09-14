// Ensure everything loads safely after DOM content is ready
document.addEventListener('DOMContentLoaded', () => {

  // --- SAMPLE SEED DATA (MITHILA PRODUCTS) ---
  const seedProducts = [
    {
      id: 'p1',
      name: 'शाही मिथिला मखान (Premium)',
      desc: 'मिथिलाक पोखरि सँ सीधे तोरल गेल सर्वोत्तम गुणवत्ताक मखान। उपवास आ स्वास्थ्यक लेल उपयुक्त।',
      price: 299,
      unit: '500g पैकेट',
      query: 'premium makhana fox nuts dry fruits raw in wooden bowl'
    },
    {
      id: 'p2',
      name: 'मिथिला मीठ पान पैक',
      desc: 'विशेष कपरपूरी पत्ता, मीठ मसाला, गुलकंद आ पारंपरिक इलायचीक स्वाद सँ युक्त पान।',
      price: 149,
      unit: '5 पीस पैक',
      query: 'traditional sweet banarasi paan betel leaf ready to eat'
    },
    {
      id: 'p3',
      name: 'मयूर मधुबनी पेंटिंग',
      desc: 'प्राकृतिक रंग आ बाँसक कूँची सँ बनाओल पारंपरिक मयूर चित्र। अहाँक घरक देबालक शोभा बढ़ाबय लेल।',
      price: 1499,
      unit: '12x12 इंच फ्रेम',
      entity: 'Madhubani art',
      query: 'madhubani art peacock handmade painting colorful'
    },
    {
      id: 'p4',
      name: 'सिक्की घासक डलिया (Sikki Basket)',
      desc: 'ग्रामीण महिला लोकनि द्वारा हस्तनिर्मित सिक्की घासक सुंदर पारंपरिक टोकरी आ डलिया।',
      price: 399,
      unit: '1 पीस',
      query: 'traditional handmade bihar sikki grass basket craft work'
    }
  ];

  // --- SAMPLE COMMUNITY REVIEWS ---
  const seedReviews = [
    {
      name: "प्रिया शर्मा",
      location: "दरभंगा, बिहार",
      rating: 5,
      msg: "मखानक दाना बहुत पैघ आ क्रिस्पी अछि। हम आर्डर कयलहुँ आ समय पर भेटि गेल। जय मिथिला!",
      date: "12/10/2024"
    },
    {
      name: "अमित मिश्र",
      location: "निजामपेट, हैदराबाद",
      rating: 5,
      msg: "हैदराबाद मे रहि क' अपन मिथिलाक पानक स्वाद भेटब अद्भुत अछि। पैकिंग बहुत सुरक्षित छल।",
      date: "08/10/2024"
    },
    {
      name: "अनामिका रेड्डी",
      location: "बेंगलुरु, कर्नाटक",
      rating: 4,
      msg: "मधुबनी पेंटिंग हमर लिविंग रूमक शोभा बढ़ा रहल अछि। बहुत सुंदर आ बारीक काम कयल गेल अछि।",
      date: "05/10/2024"
    }
  ];

  // --- STATE MANAGEMENT ---
  let cart = JSON.parse(localStorage.getItem('mithila_cart')) || {};
  let reviews = JSON.parse(localStorage.getItem('mithila_reviews')) || seedReviews;

  // --- DOM ELEMENTS ---
  const productsContainer = document.getElementById('products-container');
  const cartItemsContainer = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal-val');
  const gstEl = document.getElementById('gst-val');
  const grandTotalEl = document.getElementById('grand-total-val');
  const checkoutForm = document.getElementById('checkout-form');
  const reviewForm = document.getElementById('review-form');
  const reviewsFeed = document.getElementById('reviews-feed');
  const ratingStars = document.querySelectorAll('#rating-input i');
  const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  let selectedRating = 5;

  // --- IMAGE RESOLVER HELPER (MANDATORY FOR RUNTIME IMAGES) ---
  async function resolveImage(imgEl) {
    if (!imgEl || imgEl.dataset.r4lResolving || imgEl.dataset.r4lResolved || (imgEl.getAttribute('src') || '').trim()) return;
    imgEl.dataset.r4lResolving = '1';
    const cache = window.__r4lImgCache = window.__r4lImgCache || new Map();
    const entity = imgEl.dataset.entity;
    const query = imgEl.dataset.query || imgEl.alt || 'placeholder';
    const w = imgEl.dataset.w || 600, h = imgEl.dataset.h || 400;
    const cacheKey = (entity ? 'e:' + entity : 'q:' + query) + '@' + w + 'x' + h;
    
    if (cache.has(cacheKey)) {
      imgEl.src = cache.get(cacheKey);
      imgEl.dataset.r4lResolved = '1';
      delete imgEl.dataset.r4lResolving;
      return;
    }
    
    const getSeed = (s) => {
      let hash = 5381;
      const str = String(s || 'image');
      for (let i = 0; i < str.length; i++) { hash = ((hash << 5) + hash) + str.charCodeAt(i); hash |= 0; }
      return Math.abs(hash);
    };
    
    const seed = getSeed(entity || query);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=${w}&height=${h}&seed=${seed}&nologo=true`;
    
    if (entity) {
      try {
        const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(entity)}`);
        if (r.ok) {
          const j = await r.json();
          const src = (j.originalimage && j.originalimage.source) || (j.thumbnail && j.thumbnail.source);
          if (src) {
            cache.set(cacheKey, src);
            imgEl.src = src;
            imgEl.dataset.r4lResolved = '1';
            delete imgEl.dataset.r4lResolving;
            return;
          }
        }
      } catch (e) {}
    }
    
    try {
      const r = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=1&mature=false`);
      const j = await r.json();
      const hit = j.results && j.results[0];
      if (hit && (hit.url || hit.thumbnail)) {
        const src = hit.url || hit.thumbnail;
        cache.set(cacheKey, src);
        imgEl.src = src;
        imgEl.dataset.r4lResolved = '1';
        delete imgEl.dataset.r4lResolving;
        return;
      }
    } catch (e) {}
    
    cache.set(cacheKey, pollinationsUrl);
    imgEl.src = pollinationsUrl;
    imgEl.dataset.r4lResolved = '1';
    delete imgEl.dataset.r4lResolving;
  }
  window.resolveImage = window.resolveImage || resolveImage;

  // --- RENDER PRODUCTS ---
  function renderProducts() {
    productsContainer.innerHTML = '';
    seedProducts.forEach(prod => {
      const qty = cart[prod.id] || 0;
      const cardHtml = `
        <div class="card product-card">
          <div class="prod-img-wrapper">
            <span class="prod-price-tag">₹${prod.price}</span>
            <img data-entity="${prod.entity || ''}" data-query="${prod.query}" alt="${prod.name}" loading="lazy"
                 onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://placehold.co/600x400/111827/ffffff?text='+encodeURIComponent(/^[\x20-\x7E]*$/.test(this.alt||'')?this.alt:'Image');}else{this.onerror=null;}">
          </div>
          <div class="prod-content">
            <h4>${prod.name}</h4>
            <span class="card-badge" style="margin-bottom: 10px;">${prod.unit}</span>
            <p class="prod-desc">${prod.desc}</p>
            
            <div class="qty-control">
              ${qty === 0 ? `
                <button class="btn btn-block btn-sm" onclick="updateCart('${prod.id}', 1)">
                  <i class="fa-solid fa-plus"></i> कार्ट मे जोड़ू
                </button>
              ` : `
                <button class="qty-btn" onclick="updateCart('${prod.id}', ${qty - 1})"><i class="fa-solid fa-minus"></i></button>
                <span class="qty-val">${qty}</span>
                <button class="qty-btn" onclick="updateCart('${prod.id}', ${qty + 1})"><i class="fa-solid fa-plus"></i></button>
              `}
            </div>
          </div>
        </div>
      `;
      productsContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Resolve newly inserted images
    productsContainer.querySelectorAll('img[data-query]:not([src])').forEach(resolveImage);
  }

  // --- UPDATE CART ---
  window.updateCart = function(productId, newQty) {
    if (newQty <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = newQty;
    }
    localStorage.setItem('mithila_cart', JSON.stringify(cart));
    renderProducts();
    renderCart();
  };

  // --- RENDER CART ---
  function renderCart() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    let hasItems = false;

    seedProducts.forEach(prod => {
      const qty = cart[prod.id];
      if (qty && qty > 0) {
        hasItems = true;
        const itemTotal = prod.price * qty;
        subtotal += itemTotal;

        const cartItemHtml = `
          <div class="cart-item">
            <span class="cart-item-name">${prod.name} (x${qty})</span>
            <span class="cart-item-price">₹${itemTotal}</span>
          </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHtml);
      }
    });

    if (!hasItems) {
      cartItemsContainer.innerHTML = `<p class="empty-cart-msg">कार्ट खाली अछि। उत्पादक संग "जोड़ू" बटन दबाउ।</p>`;
    }

    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;

    subtotalEl.innerText = `₹${subtotal}`;
    gstEl.innerText = `₹${gst}`;
    grandTotalEl.innerText = `₹${grandTotal}`;
  }

  // --- CHECKOUT FORM SUBMISSION ---
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-addr').value.trim();

    const hasItems = Object.keys(cart).length > 0;
    if (!hasItems) {
      showToast("कृपया कार्ट मे कम सँ कम एकटा सामग्री जोड़ू!", "fa-circle-exclamation");
      return;
    }

    // Success Simulation
    showToast(`धन्यवाद ${name}! अहाँक आर्डर सफलतापूर्वक बुक भ' गेल।`, "fa-circle-check");
    
    // Clear Cart
    cart = {};
    localStorage.removeItem('mithila_cart');
    checkoutForm.reset();
    renderProducts();
    renderCart();
  });

  // --- RENDER REVIEWS (CHOUPAL) ---
  function renderReviews() {
    reviewsFeed.innerHTML = '';
    
    // Show empty state if no reviews
    if (reviews.length === 0) {
      reviewsFeed.innerHTML = `<p class="empty-cart-msg">एखन धरि कोनो गप-शप नहि भेल अछि। पहिल समीक्षा लिखू!</p>`;
      return;
    }

    reviews.forEach(rev => {
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        starsHtml += `<i class="fa-star ${i <= rev.rating ? 'fa-solid' : 'fa-regular'}"></i>`;
      }

      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.name)}`;

      const reviewHtml = `
        <div class="review-card animate">
          <div class="rev-header">
            <img class="rev-avatar" src="${avatarUrl}" alt="${rev.name}">
            <div class="rev-info">
              <h5>${rev.name}</h5>
              <span><i class="fa-solid fa-location-dot"></i> ${rev.location} | ${rev.date}</span>
            </div>
            <div class="rev-rating">
              ${starsHtml}
            </div>
          </div>
          <p>${rev.msg}</p>
        </div>
      `;
      reviewsFeed.insertAdjacentHTML('beforeend', reviewHtml);
    });
  }

  // --- RATING STAR INPUT SYSTEM ---
  ratingStars.forEach(star => {
    star.addEventListener('click', (e) => {
      const val = parseInt(e.target.dataset.value);
      selectedRating = val;
      
      ratingStars.forEach(s => {
        const sVal = parseInt(s.dataset.value);
        if (sVal >= val) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });

  // --- REVIEW FORM SUBMISSION ---
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rev-name').value.trim();
    const location = document.getElementById('rev-location').value.trim();
    const msg = document.getElementById('rev-msg').value.trim();

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const newReview = {
      name: name,
      location: location,
      rating: selectedRating,
      msg: msg,
      date: formattedDate
    };

    reviews.unshift(newReview);
    localStorage.setItem('mithila_reviews', JSON.stringify(reviews));
    
    showToast("अहाँक समीक्षा चौपाल पर साझा भ' गेल!", "fa-circle-check");
    
    reviewForm.reset();
    // Reset rating stars to 5
    ratingStars.forEach(s => s.classList.add('active'));
    selectedRating = 5;

    renderReviews();
  });

  // --- TOAST SYSTEM ---
  function showToast(message, iconClass = "fa-circle-check") {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    toastIcon.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    toastMsg.innerText = message;
    
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // --- NAV ACTIVE SCROLL EFFECT ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });

    // Shrink navbar on scroll
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.style.padding = '8px 0';
      navbar.style.background = 'rgba(6, 10, 8, 0.95)';
    } else {
      navbar.style.padding = '16px 0';
      navbar.style.background = 'rgba(6, 10, 8, 0.8)';
    }
  });

  // --- MOBILE NAVIGATION TOGGLE ---
  window.toggleMobileMenu = function() {
    const isVisible = mobileNav.style.display === 'flex';
    mobileNav.style.display = isVisible ? 'none' : 'flex';
  };

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

  // --- HELPER TO SMOOTH SCROLL ---
  window.scrollToSection = function(id) {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  // --- INITIAL RENDERING ---
  renderProducts();
  renderCart();
  renderReviews();

  // Resolve static page images
  document.querySelectorAll('img[data-query]:not([src])').forEach(resolveImage);
});