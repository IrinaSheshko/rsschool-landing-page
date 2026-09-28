document.addEventListener('DOMContentLoaded', () => {
    /* Theme start */
    const themeBtn = document.getElementById('theme-btn');
    
    if (themeBtn) {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
            themeBtn.textContent = '☀️';
        }

        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
                themeBtn.textContent = '☀️';
            } else {
                localStorage.setItem('theme', 'light');
                themeBtn.textContent = '🌙';
            }
        });
    }
    /* Theme end */
});

/* Cards start */
const cardsGrid = document.getElementById('cards-grid');
const loadMoreBtn = document.getElementById('load-more-btn');
let visibleCardsCount = 4; 

/* Check screen start */
function checkScreenWidth() {
    if (window.innerWidth > 768) {
        visibleCardsCount = 99;
    } else {
        visibleCardsCount = 4;
    }
}

function resetCardsCount() {
    if (window.innerWidth <= 768) {
        visibleCardsCount = 4;
    } else {
        visibleCardsCount = 99;
    }
}
/* Check screen end */

async function loadCards(currentCategory = 'coffee') {
    if (!cardsGrid) return; 

    try {
        const response = await fetch('./products.json');
        const products = await response.json();

        cardsGrid.innerHTML = ''; 

        // Filter 
        const filteredProducts = products.filter((product) => product.category === currentCategory);
        
        if (loadMoreBtn) {
            if (visibleCardsCount >= filteredProducts.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }
            
        filteredProducts.slice(0, visibleCardsCount).forEach((product) => {
            const card = document.createElement('article');
            card.classList.add('card');
            card.setAttribute('data-name', product.name); 

            card.innerHTML = `
                <div class="card__img-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="card__img">
                </div>
                <div class="card__content">
                    <h2 class="card__title">${product.name}</h2>
                    <p class="card__desc">${product.description}</p>
                    <span class="card__price">$${product.price}</span>
                </div>
            `;
            
            cardsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}
/* Cards end */

/* Categories start */
const categoriesContainer = document.getElementById('categories-container');

if (categoriesContainer) {
    categoriesContainer.addEventListener('click', (event) => {
        const targetBtn = event.target.closest('.cat-btn');
        if (!targetBtn) return; 

        document.querySelectorAll('.cat-btn').forEach((btn) => {
            btn.classList.remove('active');
        });

        targetBtn.classList.add('active');
        const selectedCategory = targetBtn.dataset.category;
        
        resetCardsCount();
        loadCards(selectedCategory);
    });
}
/* Categories end */

/* LoadMore start */
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        visibleCardsCount += 4;

        const activeCategoryBtn = document.querySelector('.cat-btn.active');
        const currentCategory = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'coffee';

        loadCards(currentCategory);
    });
}
/* LoadMore end */


/* Initialization and Resize Listener start */
if (cardsGrid) {
    checkScreenWidth();
    loadCards();

    window.addEventListener('resize', () => {
        
        if (window.innerWidth > 768 && visibleCardsCount < 99) {
            visibleCardsCount = 99;
            const activeCategoryBtn = document.querySelector('.cat-btn.active');
            const currentCategory = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'coffee';
            loadCards(currentCategory);
        }
    });
}
/* Initialization and Resize Listener end */ 


/* Modal Window Logic start */
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close');

let currentProduct = null;
let selectedSizePrice = 0;
let selectedAdditivesPrice = 0;

if (cardsGrid) {
    cardsGrid.addEventListener('click', async (e) => {
        const card = e.target.closest('.card');
        if (!card) return;

        const productName = card.getAttribute('data-name');
        
        try {
            const response = await fetch('./products.json');
            const products = await response.json();
            const product = products.find(p => p.name === productName);

            if (product) {
                openModal(product);
            }
        } catch (err) {
            console.error('Ошибка открытия модалки:', err);
        }
    });
}

function openModal(product) {
    currentProduct = product;
    selectedSizePrice = 0;
    selectedAdditivesPrice = 0;

   
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    if (modalImg) modalImg.src = product.image;
    if (modalTitle) modalTitle.textContent = product.name;
    if (modalDesc) modalDesc.textContent = product.description;

    // Sizes
    const sizesContainer = document.getElementById('modal-sizes');
    if (sizesContainer && product.sizes) {
        sizesContainer.innerHTML = '';
        Object.keys(product.sizes).forEach((key, index) => {
            const sizeData = product.sizes[key];
            const btn = document.createElement('button');
            btn.classList.add('modal__option-btn');
            if (index === 0) btn.classList.add('active');
            
            btn.innerHTML = `<span>${key.toUpperCase()}</span> ${sizeData.size}`;
            btn.addEventListener('click', () => {
                sizesContainer.querySelectorAll('.modal__option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSizePrice = parseFloat(sizeData['add-price']);
                updateTotalPrice();
            });

            sizesContainer.appendChild(btn);
        });
    }

    // Additives
    const additivesContainer = document.getElementById('modal-additives');
    if (additivesContainer && product.additives) {
        additivesContainer.innerHTML = '';
        product.additives.forEach((add, index) => {
            const btn = document.createElement('button');
            btn.classList.add('modal__option-btn');
            
            btn.innerHTML = `<span>${index + 1}</span> ${add.name}`;
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                
               
                const activeAdditives = additivesContainer.querySelectorAll('.modal__option-btn.active');
                selectedAdditivesPrice = activeAdditives.length * parseFloat(add['add-price']);
                updateTotalPrice();
            });

            additivesContainer.appendChild(btn);
        });
    }

    updateTotalPrice();

    if (modal) modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function updateTotalPrice() {
    if (!currentProduct) return;
    const basePrice = parseFloat(currentProduct.price);
    const totalPrice = basePrice + selectedSizePrice + selectedAdditivesPrice;
    
    const priceElement = document.getElementById('modal-total-price');
    if (priceElement) {
        priceElement.textContent = `$${totalPrice.toFixed(2)}`;
    }
}

function closeModal() {
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
    }
});
/* Modal Window Logic end */


/* Burger-menu start */ 
    const burgerBtn = document.getElementById('burger-btn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

function closeBurgerMenu() {
    if (burgerBtn && navMenu) {
        burgerBtn.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.classList.remove('no-scroll');
    }
}

function toggleBurgerMenu() {
    if (burgerBtn && navMenu) {
        burgerBtn.classList.toggle('open');
        navMenu.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    }
}

if (burgerBtn && navMenu) {
    burgerBtn.addEventListener('click', toggleBurgerMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeBurgerMenu();
    });
});

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('open')) {
            closeBurgerMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
            closeBurgerMenu();
        }
    });
}
/* Burger-menu end */

/* Slider start */
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide++;
            if (currentSlide >= slides.length) {
                currentSlide = 0; 
            }
            showSlide(currentSlide);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide--;
            if (currentSlide < 0) {
                currentSlide = slides.length - 1; 
            }
            showSlide(currentSlide);
        });
    }
/* Slider end */