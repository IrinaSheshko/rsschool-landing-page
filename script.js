document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    
    if (!themeBtn) return;

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
});

/* Cards start*/

const cardsGrid = document.getElementById('cards-grid'); 

async function loadCards(currentCategory = 'coffee') {
    const responce = await fetch('./products.json');
    const products = await responce.json();

    cardsGrid.innerHTML = ' ';

    products
    .filter((product) => product.category === currentCategory)
    .slice(0, 4)
    .forEach((product) => {
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
    })
}
loadCards();

/* Cards end*/

/* Categories start (const for the buttom)*/

    const categoriesContainer = document.getElementById('categories-container');

    categoriesContainer.addEventListener('click', (event) => {
        const targetBtn = event.target.closest('.cat-btn');
        if (!targetBtn) return; 

        /*remove button active */

        document.querySelectorAll('.cat-btn').forEach((btn) => {
            btn.classList.remove('active');
        });

        targetBtn.classList.add('active');
        const selectedCategory = targetBtn.dataset.category;

        loadCards(selectedCategory);
    })

/* Categories end*/