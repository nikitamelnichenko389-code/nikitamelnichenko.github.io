// Главный файл JavaScript
class FenomenVernostiApp {
    constructor() {
        this.currentTheme = 'light';
        this.currentSection = 'about';
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.restoreUserPreferences();
        this.setupScrollProgress();
        console.log('🚀 Приложение "Феномен верности" запущено');
    }

    setupEventListeners() {
        // Плавная прокрутка
        this.setupSmoothScroll();
        
        // Мобильное меню
        this.setupMobileMenu();
        
        // Переключение темы
        this.setupThemeSwitcher();
        
        // Поиск
        this.setupSearch();
        
        // Модальные окна
        this.setupModals();
        
        // Тест
        this.setupTest();
        
        // Форма обратной связи
        this.setupContactForm();
    }

    // === ПЛАВНАЯ ПРОКРУТКА ===
    setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            this.currentSection = sectionId;
            this.updateActiveNavLink(sectionId);
        }
    }

    updateActiveNavLink(activeId) {
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`nav a[href="#${activeId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // === МОБИЛЬНОЕ МЕНЮ ===
    setupMobileMenu() {
        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('nav');
        
        if (burger && nav) {
            burger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Закрываем меню при клике на ссылку
            nav.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('nav');
        
        this.isMenuOpen = !this.isMenuOpen;
        burger.classList.toggle('active');
        nav.classList.toggle('active');
    }

    closeMobileMenu() {
        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('nav');
        
        this.isMenuOpen = false;
        burger.classList.remove('active');
        nav.classList.remove('active');
    }

    // === ПЕРЕКЛЮЧЕНИЕ ТЕМЫ ===
    setupThemeSwitcher() {
        const themeSwitcher = document.querySelector('.theme-switcher-header');
        
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Сохраняем выбор
        localStorage.setItem('theme', this.currentTheme);
        
        // Обновляем иконку
        this.updateThemeIcon();
        
        this.showNotification(`Тема изменена на ${this.currentTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // === ПОИСК ПО САЙТУ ===
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        if (searchInput && searchResults) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                if (query.length > 2) {
                    this.performSearch(query);
                } else {
                    searchResults.style.display = 'none';
                }
            });
            
            // Закрываем результаты при клике вне поиска
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.style.display = 'none';
                }
            });
        }
    }

    performSearch(query) {
        const searchResults = document.getElementById('searchResults');
        const results = this.searchContent(query);
        
        if (results.length > 0) {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="app.selectSearchResult('${result.id}')">
                    <strong>${result.title}</strong>
                    <p>${result.preview}</p>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
            searchResults.style.display = 'block';
        }
    }

    searchContent(query) {
        // Здесь будет реальный поиск по контенту
        // Пока заглушка
        return [
            {
                id: 'about',
                title: 'О проекте',
                preview: 'Исследование ценностного выбора защитников Донбасса'
            },
            {
                id: 'heroes',
                title: 'Герои исследования',
                preview: 'Моторола, Гиви, Захарченко'
            }
        ].filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.preview.toLowerCase().includes(query.toLowerCase())
        );
    }

    selectSearchResult(sectionId) {
        this.scrollToSection(sectionId);
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('searchInput').value = '';
    }

    // === ПРОГРЕСС ЧТЕНИЯ ===
    setupScrollProgress() {
        const progressElement = document.getElementById('readingProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressElement && progressFill && progressText) {
            window.addEventListener('scroll', () => {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset;
                
                const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
                const roundedProgress = Math.round(progress);
                
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Прогресс чтения: ${roundedProgress}%`;
                
                // Показываем/скрываем прогресс
                if (scrollTop > 200) {
                    progressElement.classList.add('active');
                } else {
                    progressElement.classList.remove('active');
                }
            });
        }
    }

    // === МОДАЛЬНЫЕ ОКНА ===
    setupModals() {
        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
        
        // ESC для закрытия
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    // === ГЕРОИ ===
    showHeroDetail(heroId) {
        const heroes = {
            zaharchenko: {
                name: 'Александр Захарченко',
                bio: 'Первый глава ДНР...',
                // остальные данные
            },
            motorola: {
                name: 'Арсен Павлов "Моторола"',
                bio: 'Командир, который шёл первым...',
            },
            givi: {
                name: 'Михаил Толстых "Гиви"',
                bio: 'Шахтёр, ставший символом...',
            }
        };
        
        const hero = heroes[heroId];
        if (hero) {
            const modalBody = document.getElementById('heroBody');
            modalBody.innerHTML = `
                <h2>${hero.name}</h2>
                <p>${hero.bio}</p>
                <!-- Дополнительный контент -->
            `;
            this.openModal('heroModal');
        }
    }

    // === ТЕСТ ===
    setupTest() {
        // Инициализация теста
        window.startTest = () => {
            document.getElementById('testStart').style.display = 'none';
            document.getElementById('testQuestions').style.display = 'block';
            this.loadTestQuestions();
        };
    }

    loadTestQuestions() {
        const questions = [
            {
                question: "Что для вас важнее в сложной ситуации?",
                answers: [
                    "Верность своим принципам",
                    "Практическая польза",
                    "Безопасность близких",
                    "Справедливость"
                ]
            },
            // больше вопросов...
        ];
        
        const container = document.getElementById('testQuestions');
        container.innerHTML = questions.map((q, index) => `
            <div class="question">
                <h3>Вопрос ${index + 1}</h3>
                <p>${q.question}</p>
                <div class="answers">
                    ${q.answers.map((answer, ansIndex) => `
                        <div class="answer" onclick="app.selectAnswer(${index}, ${ansIndex})">
                            ${answer}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('') + '<button onclick="app.finishTest()" class="button primary">Завершить тест</button>';
    }

    selectAnswer(questionIndex, answerIndex) {
        const answers = document.querySelectorAll(`.question:nth-child(${questionIndex + 1}) .answer`);
        answers.forEach((answer, index) => {
            answer.classList.toggle('selected', index === answerIndex);
        });
    }

    finishTest() {
        // Логика подсчёта результатов
        document.getElementById('testQuestions').style.display = 'none';
        document.getElementById('testResult').style.display = 'block';
        
        document.getElementById('testResult').innerHTML = `
            <h3>Ваш ценностный код</h3>
            <p>Вы - человек верности и долга!</p>
            <button onclick="app.restartTest()" class="button primary">Пройти ещё раз</button>
        `;
    }

    restartTest() {
        document.getElementById('testResult').style.display = 'none';
        document.getElementById('testStart').style.display = 'block';
    }

    // === ФОРМА ОБРАТНОЙ СВЯЗИ ===
    setupContactForm() {
        const form = document.getElementById('feedbackForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        }
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        
        // Валидация
        if (!data.name || !data.email || !data.message) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (!this.isValidEmail(data.email)) {
            this.showNotification('Введите корректный email', 'error');
            return;
        }
        
        // Отправка формы (заглушка)
        this.showNotification('Сообщение отправлено!', 'success');
        form.reset();
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // === УВЕДОМЛЕНИЯ ===
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    // === СОХРАНЕНИЕ НАСТРОЕК ===
    restoreUserPreferences() {
        // Тема
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.body.setAttribute('data-theme', this.currentTheme);
            this.updateThemeIcon();
        }
        
        // Прогресс теста и т.д.
    }

    // === ЭКСПОРТ И ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ===
    exportToPDF() {
        this.showNotification('Функция экспорта в PDF будет доступна скоро!', 'info');
    }

    startAudioBook() {
        this.showNotification('Аудиокнига будет доступна скоро!', 'info');
    }

    shareQuote(index) {
        const quotes = [
            "Мы сделали свой выбор. И назад дороги нет.",
            "На войне нет времени на сомнения. Решил — делай.",
            "Мы не наёмники. Мы защищаем свои дома."
        ];
        
        if (navigator.share) {
            navigator.share({
                title: 'Цитата',
                text: quotes[index]
            });
        } else {
            // Fallback для копирования в буфер
            navigator.clipboard.writeText(quotes[index]);
            this.showNotification('Цитата скопирована в буфер!', 'success');
        }
    }

    addToFavorites(index) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.push(index);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.showNotification('Цитата добавлена в избранное!', 'success');
    }
}

// Создаем глобальный экземпляр приложения
const app = new FenomenVernostiApp();

// Делаем доступным глобально для обработчиков событий в HTML
window.app = app;

// Глобальные функции для HTML атрибутов
window.toggleTheme = () => app.toggleTheme();
window.toggleMenu = () => app.toggleMobileMenu();
window.showHeroDetail = (heroId) => app.showHeroDetail(heroId);
window.shareQuote = (index) => app.shareQuote(index);
window.addToFavorites = (index) => app.addToFavorites(index);
window.exportToPDF = () => app.exportToPDF();
window.startAudioBook = () => app.startAudioBook();
window.startTest = () => app.startTest();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена!');
});
