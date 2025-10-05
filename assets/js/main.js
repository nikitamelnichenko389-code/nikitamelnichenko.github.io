// Главное приложение
class FenomenVernostiApp {
    constructor() {
        this.currentTheme = 'light';
        this.currentSection = 'about';
        this.isMenuOpen = false;
        this.lastScrollY = 0;
        this.isReadingMode = false;
        this.testAnswers = [];
        this.currentChapter = 1;
        this.totalChapters = 11;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupHidingHeader();
        this.restoreUserPreferences();
        this.setupScrollProgress();
        this.showNotification('Добро пожаловать на сайт!', 'info');
        
        console.log('🚀 Приложение "Феномен верности" запущено');
    }

    setupEventListeners() {
        // Плавная прокрутка
        this.setupSmoothScroll();
        
        // Поиск
        this.setupSearch();
        
        // Форма обратной связи
        this.setupContactForm();
        
        // Глобальные обработчики
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    }

    // ==================== СКРЫВАЮЩАЯСЯ ШАПКА ====================
    setupHidingHeader() {
        const header = document.getElementById('mainHeader');
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
                
                if (currentScroll > lastScroll && currentScroll > 300) {
                    // Скролл вниз - скрываем шапку
                    header.classList.add('hidden');
                } else {
                    // Скролл вверх - показываем шапку
                    header.classList.remove('hidden');
                }
            } else {
                // Вверху страницы
                header.classList.remove('scrolled', 'hidden');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ==================== ТЕМА ====================
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
        this.showNotification(`Тема изменена на ${this.currentTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // ==================== МЕНЮ ====================
    toggleMenu() {
        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('nav');
        
        this.isMenuOpen = !this.isMenuOpen;
        burger.classList.toggle('active');
        nav.classList.toggle('active');
    }

    // ==================== ПЛАВНАЯ ПРОКРУТКА ====================
    setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                
                // Закрываем мобильное меню
                if (this.isMenuOpen) {
                    this.toggleMenu();
                }
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

    // ==================== ПОИСК ====================
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
        const searchData = [
            { id: 'about', title: 'О проекте', preview: 'Исследование ценностного выбора защитников Донбасса' },
            { id: 'heroes', title: 'Герои исследования', preview: 'Моторола, Гиви, Захарченко' },
            { id: 'timeline', title: 'Хронология событий', preview: 'Основные даты и события 2014-2022' },
            { id: 'quotes', title: 'Цитаты', preview: 'Ключевые высказывания героев' },
            { id: 'book', title: 'Книга', preview: 'Полное исследование феномена верности' }
        ];
        
        return searchData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.preview.toLowerCase().includes(query.toLowerCase())
        );
    }

    selectSearchResult(sectionId) {
        this.scrollToSection(sectionId);
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('searchInput').value = '';
    }

    // ==================== ПРОГРЕСС ЧТЕНИЯ ====================
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
                
                if (scrollTop > 200) {
                    progressElement.classList.add('active');
                } else {
                    progressElement.classList.remove('active');
                }
            });
        }
    }

    toggleReadingMode() {
        this.isReadingMode = !this.isReadingMode;
        document.body.classList.toggle('reading-mode', this.isReadingMode);
        
        if (this.isReadingMode) {
            document.querySelectorAll('section').forEach(section => {
                section.style.maxWidth = '800px';
                section.style.margin = '2rem auto';
            });
            this.showNotification('Режим чтения включен', 'info');
        } else {
            document.querySelectorAll('section').forEach(section => {
                section.style.maxWidth = '';
                section.style.margin = '';
            });
            this.showNotification('Режим чтения выключен', 'info');
        }
    }

    // ==================== МОДАЛЬНЫЕ ОКНА ====================
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

    // ==================== ГЕРОИ ====================
    showHeroDetail(heroId) {
        const heroes = {
            zaharchenko: {
                name: 'Александр Захарченко',
                bio: 'Первый глава Донецкой Народной Республики. Родился 26 июня 1976 года в Донецке. Прошёл путь от шахтёра до руководителя республики. Погиб 31 августа 2018 года в результате теракта.',
                quotes: [
                    "Мы сделали свой выбор. И назад дороги нет.",
                    "Мы защищаем свою землю, свои семьи, свою правду.",
                    "Наша сила - в правде и в единстве."
                ],
                facts: [
                    "Работал на шахте имени Засядько",
                    "Участвовал в обороне Донецка с первых дней",
                    "Был избран главой ДНР в 2014 году"
                ]
            },
            motorola: {
                name: 'Арсен Павлов "Моторола"',
                bio: 'Командир подразделения "Спарта", один из символов народного сопротивления. Родился 2 февраля 1983 года в Ухте. Прославился участием в боях за донецкий аэропорт. Погиб 16 октября 2016 года.',
                quotes: [
                    "На войне нет времени на сомнения. Решил — делай.",
                    "Мы воюем за правду, а правда всегда побеждает.",
                    "Я обычный парень, который защищает свой дом."
                ],
                facts: [
                    "Проходил службу в морской пехоте",
                    "Участвовал в штурме донецкого аэропорта",
                    "Стал одним из самых известных командиров ополчения"
                ]
            },
            givi: {
                name: 'Михаил Толстых "Гиви"',
                bio: 'Командир подразделения "Сомали", шахтёр, ставший народным героем. Родился 19 июля 1980 года в Иловайске. Прославился своими видеообращениями и участием в ключевых сражениях. Погиб 8 февраля 2017 года.',
                quotes: [
                    "Мы не наёмники. Мы защищаем свои дома.",
                    "У нас нет другого выбора, кроме как победить.",
                    "Наша сила в том, что мы защищаем правду."
                ],
                facts: [
                    "Работал на шахте более 10 лет",
                    "Командовал обороной Иловайска",
                    "Стал символом стойкости простых людей"
                ]
            }
        };
        
        const hero = heroes[heroId];
        if (hero) {
            const modalBody = document.getElementById('heroBody');
            modalBody.innerHTML = `
                <div class="hero-detail">
                    <h2>${hero.name}</h2>
                    <div class="hero-bio">
                        <p>${hero.bio}</p>
                    </div>
                    <div class="hero-quotes">
                        <h3>Ключевые цитаты:</h3>
                        ${hero.quotes.map(quote => `<blockquote>${quote}</blockquote>`).join('')}
                    </div>
                    <div class="hero-facts">
                        <h3>Факты:</h3>
                        <ul>
                            ${hero.facts.map(fact => `<li>${fact}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            this.openModal('heroModal');
        }
    }

    // ==================== ГАЛЕРЕЯ ====================
    openGallery(index) {
        const galleries = [
            { title: 'Фото героев', content: 'Архивные фотографии Моторолы, Гиви и Захарченко' },
            { title: 'Карты Донбасса', content: 'Карты боевых действий и расположения сил' },
            { title: 'Документы', content: 'Исторические документы и свидетельства' },
            { title: 'Видеоархив', content: 'Видеообращения и хроники событий' }
        ];
        
        const gallery = galleries[index];
        if (gallery) {
            const galleryBody = document.getElementById('galleryBody');
            galleryBody.innerHTML = `
                <h2>${gallery.title}</h2>
                <div class="gallery-content">
                    <p>${gallery.content}</p>
                    <div class="gallery-placeholder">
                        🖼️ Здесь будут размещены материалы галереи
                    </div>
                </div>
            `;
            this.openModal('galleryModal');
        }
    }

    // ==================== ЦИТАТЫ ====================
    shareQuote(index) {
        const quotes = [
            "Мы сделали свой выбор. И назад дороги нет.",
            "На войне нет времени на сомнения. Решил — делай.",
            "Мы не наёмники. Мы защищаем свои дома. У нас нет другого выбора."
        ];
        
        const quote = quotes[index];
        
        if (navigator.share) {
            navigator.share({
                title: 'Цитата с сайта "Феномен верности"',
                text: quote
            });
        } else {
            navigator.clipboard.writeText(quote).then(() => {
                this.showNotification('Цитата скопирована в буфер обмена!', 'success');
            });
        }
    }

    addToFavorites(index) {
        let favorites = JSON.parse(localStorage.getItem('quoteFavorites') || '[]');
        if (!favorites.includes(index)) {
            favorites.push(index);
            localStorage.setItem('quoteFavorites', JSON.stringify(favorites));
            this.showNotification('Цитата добавлена в избранное!', 'success');
        } else {
            this.showNotification('Цитата уже в избранном!', 'info');
        }
    }

    // ==================== КНИГА И ГЛАВЫ ====================
    openChapter(chapterNumber) {
        this.currentChapter = chapterNumber;
        
        const chapters = {
            1: {
                title: "Глава 1: Введение в феномен верности",
                content: `
                    <h2>Введение в феномен верности</h2>
                    <p>Верность — это не просто слово в нашем лексиконе. Это фундаментальный выбор, который определяет судьбу человека, его место в истории и значение его жизни.</p>
                    
                    <h3>Что такое верность?</h3>
                    <p>В контексте нашего исследования верность понимается как сознательный выбор оставаться преданным своим принципам, своим товарищам и своей земле даже перед лицом смертельной опасности.</p>
                    
                    <h3>Методология исследования</h3>
                    <p>Мы используем комплексный подход, сочетающий исторический анализ, биографические исследования и ценностный подход к пониманию мотивации.</p>
                    
                    <p>Через призму жизни и выбора конкретных людей — Александра Захарченко, Арсена Павлова (Моторолы) и Михаила Толстых (Гиви) — мы пытаемся понять универсальные механизмы человеческого поведения в экстремальных условиях.</p>
                `
            },
            2: {
                title: "Глава 2: Исторический контекст Донбасса",
                content: `
                    <h2>Исторический контекст Донбасса</h2>
                    <p>Чтобы понять выбор защитников Донбасса, необходимо погрузиться в исторический контекст региона.</p>
                    
                    <h3>Донбасс: перекресток цивилизаций</h3>
                    <p>Донецкий бассейн исторически был местом встречи различных культур, традиций и мировоззрений.</p>
                    
                    <h3>2014 год: точка невозврата</h3>
                    <p>События 2014 года стали тем рубежом, когда обычные люди были вынуждены сделать экстраординарный выбор.</p>
                `
            },
            3: {
                title: "Глава 3: Феномен народного сопротивления", 
                content: `
                    <h2>Феномен народного сопротивления</h2>
                    <p>Анализ мотивации простых людей, взявших в руки оружие для защиты своего дома.</p>
                `
            }
        };
        
        const chapter = chapters[chapterNumber] || chapters[1];
        const modalBody = document.getElementById('modalBody');
        const chapterTitle = document.getElementById('currentChapterTitle');
        
        chapterTitle.textContent = chapter.title;
        modalBody.innerHTML = chapter.content;
        
        this.updateChapterProgress();
        this.openModal('chapterModal');
    }

    prevChapter() {
        if (this.currentChapter > 1) {
            this.currentChapter--;
            this.openChapter(this.currentChapter);
        }
    }

    nextChapter() {
        if (this.currentChapter < this.totalChapters) {
            this.currentChapter++;
            this.openChapter(this.currentChapter);
        }
    }

    updateChapterProgress() {
        const progress = (this.currentChapter / this.totalChapters) * 100;
        const progressFill = document.getElementById('chapterProgressFill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    // ==================== ТЕСТ ====================
    startTest() {
        document.getElementById('testStart').style.display = 'none';
        document.getElementById('testQuestions').style.display = 'block';
        this.loadTestQuestions();
    }

    loadTestQuestions() {
        const questions = [
            {
                question: "Что для вас важнее в сложной ситуации?",
                answers: [
                    "Верность своим принципам",
                    "Практическая польза и выгода", 
                    "Безопасность близких людей",
                    "Справедливость и честность"
                ]
            },
            {
                question: "Как бы вы поступили, если бы пришлось защищать свой дом?",
                answers: [
                    "Взял бы в руки оружие без раздумий",
                    "Попытался бы найти мирное решение",
                    "Уехал бы в безопасное место",
                    "Организовал бы сопротивление"
                ]
            },
            {
                question: "Что значит для вас понятие 'долг'?",
                answers: [
                    "Ответственность перед своими близкими и Родиной",
                    "Выполнение взятых на себя обязательств",
                    "Следование закону и правилам",
                    "Внутреннее чувство правильного"
                ]
            }
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
        
        this.testAnswers = new Array(questions.length).fill(null);
    }

    selectAnswer(questionIndex, answerIndex) {
        const answers = document.querySelectorAll(`.question:nth-child(${questionIndex + 1}) .answer`);
        answers.forEach((answer, index) => {
            answer.classList.toggle('selected', index === answerIndex);
        });
        
        this.testAnswers[questionIndex] = answerIndex;
    }

    finishTest() {
        const answered = this.testAnswers.filter(a => a !== null).length;
        if (answered < this.testAnswers.length) {
            this.showNotification('Ответьте на все вопросы!', 'error');
            return;
        }
        
        document.getElementById('testQuestions').style.display = 'none';
        document.getElementById('testResult').style.display = 'block';
        
        // Простой анализ результатов
        const result = this.analyzeTestResults();
        
        document.getElementById('testResult').innerHTML = `
            <h3>Ваш ценностный код</h3>
            <div class="result-content">
                <p><strong>Тип личности:</strong> ${result.type}</p>
                <p><strong>Основная ценность:</strong> ${result.value}</p>
                <p><strong>Описание:</strong> ${result.description}</p>
            </div>
            <button onclick="app.restartTest()" class="button primary">Пройти тест ещё раз</button>
        `;
    }

    analyzeTestResults() {
        const results = [
            {
                type: "Человек верности",
                value: "Преданность и долг", 
                description: "Вы ставите верность своим принципам и близким выше личной выгоды. В критической ситуации способны на самопожертвование."
            },
            {
                type: "Прагматик", 
                value: "Рациональность и практичность",
                description: "Вы руководствуетесь разумом и практической пользой. Умеете находить оптимальные решения в сложных ситуациях."
            },
            {
                type: "Защитник",
                value: "Безопасность и стабильность", 
                description: "Ваш главный приоритет - защита близких и создание безопасной среды. Вы надежный и ответственный человек."
            }
        ];
        
        return results[0]; // Упрощенный результат
    }

    restartTest() {
        document.getElementById('testResult').style.display = 'none';
        document.getElementById('testStart').style.display = 'block';
        this.testAnswers = [];
    }

    // ==================== КОНТАКТЫ ====================
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
            this.showNotification('Заполните все поля!', 'error');
            return;
        }
        
        if (!this.isValidEmail(data.email)) {
            this.showNotification('Введите корректный email!', 'error');
            return;
        }
        
        // Имитация отправки
        setTimeout(() => {
            this.showNotification('Сообщение отправлено! Спасибо за обратную связь.', 'success');
            form.reset();
        }, 1000);
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ==================== РЕЙТИНГ ====================
    setRating(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.opacity = '1';
            } else {
                star.style.opacity = '0.3';
            }
        });
        
        this.showNotification(`Спасибо за оценку ${rating} звезд!`, 'success');
        
        // Сохраняем рейтинг
        localStorage.setItem('bookRating', rating);
    }

    // ==================== УВЕДОМЛЕНИЯ ====================
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

    // ==================== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ====================
    exportToPDF() {
        this.showNotification('Функция экспорта в PDF будет доступна в ближайшее время!', 'info');
    }

    startAudioBook() {
        this.showNotification('Аудиоверсия книги готовится к выпуску!', 'info');
    }

    showPrivacyPolicy() {
        this.showNotification('Политика конфиденциальности будет размещена здесь.', 'info');
    }

    exportUserData() {
        const userData = {
            theme: this.currentTheme,
            favorites: JSON.parse(localStorage.getItem('quoteFavorites') || '[]'),
            rating: localStorage.getItem('bookRating'),
            lastVisit: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'fenomen-vernosti-data.json';
        link.click();
        
        this.showNotification('Данные успешно экспортированы!', 'success');
    }

    clearProgress() {
        localStorage.removeItem('quoteFavorites');
        localStorage.removeItem('bookRating');
        this.showNotification('Прогресс очищен!', 'success');
    }

    // ==================== ВОССТАНОВЛЕНИЕ НАСТРОЕК ====================
    restoreUserPreferences() {
        // Тема
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.body.setAttribute('data-theme', this.currentTheme);
            this.updateThemeIcon();
        }
        
        // Рейтинг
        const savedRating = localStorage.getItem('bookRating');
        if (savedRating) {
            this.setRating(parseInt(savedRating));
        }
    }
}

// Создаем глобальный экземпляр приложения
const app = new FenomenVernostiApp();

// Делаем доступным глобально для HTML атрибутов
window.app = app;

// Инициализация при полной загрузке страницы
window.addEventListener('load', () => {
    console.log('Страница полностью загружена!');
});
