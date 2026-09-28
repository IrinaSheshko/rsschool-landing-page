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

            card.innerHTML = `
                <a href="#" class="card__link">
                    <img src="${product.image}" alt="${product.name}" class="card__img">
                </a>
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
        
        checkScreenWidth();
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
        checkScreenWidth();

        const activeCategoryBtn = document.querySelector('.cat-btn.active');
        const currentCategory = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'coffee';
        
        loadCards(currentCategory);
    });
}
/* Initialization and Resize Listener end */ 

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
        link.addEventListener('click', closeBurgerMenu);
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
