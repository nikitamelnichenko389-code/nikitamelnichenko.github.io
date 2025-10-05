// Простой код для твоего сайта

// Меняем тему (тёмная/светлая)
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    
    // Сохраняем выбор пользователя
    localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Плавная прокрутка к разделам
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Поиск по сайту
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchText = e.target.value.toLowerCase();
            // Здесь будет код поиска
            console.log('Ищем:', searchText);
        });
    }
}

// Запускаем всё когда страница загрузится
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен!');
    setupSearch();
    
    // Восстанавливаем тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});
