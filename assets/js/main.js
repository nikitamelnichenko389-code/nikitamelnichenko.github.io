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
        this.showNotification('Добро пожаловать на сайт "Феномен верности"!', 'info');
        
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
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        });

        // Закрытие модальных окон при клике вне контента
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    // ==================== СКРЫВАЮЩАЯСЯ ШАПКА ====================
    setupHidingHeader() {
        const header = document.getElementById('mainHeader');
        let lastScroll = 0;
        let scrollTimeout;
        
        const handleScroll = () => {
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
        };

        // Оптимизированный скролл с троттлингом
        const throttledScroll = this.throttle(handleScroll, 100);
        window.addEventListener('scroll', throttledScroll, { passive: true });
    }

    // ==================== ТЕМА ====================
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
        
        const themeName = this.currentTheme === 'dark' ? 'тёмную' : 'светлую';
        this.showNotification(`Тема изменена на ${themeName}`, 'info');
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        const themeSwitcher = document.querySelector('.theme-switcher-header');
        
        if (themeIcon && themeSwitcher) {
            themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
            themeSwitcher.setAttribute('aria-label', 
                this.currentTheme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
            );
        }
    }

    // ==================== МЕНЮ ====================
    toggleMenu() {
        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('nav');
        
        this.isMenuOpen = !this.isMenuOpen;
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        
        // Обновляем accessibility
        burger.setAttribute('aria-expanded', this.isMenuOpen);
    }

    closeMenu() {
        const burger = document.querySelector('.burger-menu');
        const nav = document.querySelector('nav');
        
        this.isMenuOpen = false;
        burger.classList.remove('active');
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
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
                    this.closeMenu();
                }
            });
        });
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const header = document.querySelector('header');
            const headerHeight = header.offsetHeight;
            const headerOffset = header.classList.contains('scrolled') ? 80 : 120;
            const targetPosition = element.offsetTop - headerOffset;
            
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
            // Дебаунс для оптимизации поиска
            const debouncedSearch = this.debounce((query) => {
                this.performSearch(query);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                if (query.length > 1) {
                    debouncedSearch(query);
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

            // Обработка клавиш в поиске
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const firstResult = searchResults.querySelector('.search-result-item');
                    if (firstResult) {
                        firstResult.click();
                    }
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
                    <strong>${this.highlightText(result.title, query)}</strong>
                    <p>${this.highlightText(result.preview, query)}</p>
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
            { 
                id: 'about', 
                title: 'О проекте', 
                preview: 'Исследование ценностного выбора защитников Донбасса' 
            },
            { 
                id: 'heroes', 
                title: 'Герои исследования', 
                preview: 'Моторола, Гиви, Захарченко - анализ их ценностного кода' 
            },
            { 
                id: 'timeline', 
                title: 'Хронология событий', 
                preview: 'Основные даты и события 2014-2022 годов' 
            },
            { 
                id: 'quotes', 
                title: 'Цитаты', 
                preview: 'Ключевые высказывания героев и их анализ' 
            },
            { 
                id: 'book', 
                title: 'Книга', 
                preview: 'Полное исследование феномена верности в формате книги' 
            },
            { 
                id: 'chapters', 
                title: 'Главы книги', 
                preview: 'Содержание и основные разделы исследования' 
            },
            { 
                id: 'test', 
                title: 'Тест', 
                preview: 'Определите ваш ценностный код' 
            },
            { 
                id: 'contact', 
                title: 'Контакты', 
                preview: 'Связь с автором проекта' 
            }
        ];
        
        const lowerQuery = query.toLowerCase();
        return searchData.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) ||
            item.preview.toLowerCase().includes(lowerQuery)
        );
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
            const updateProgress = () => {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset;
                
                const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
                const roundedProgress = Math.round(progress);
                
                progressFill.style.width = `${progress}%`;
                progressFill.setAttribute('aria-valuenow', roundedProgress);
                progressText.textContent = `Прогресс чтения: ${roundedProgress}%`;
                
                if (scrollTop > 200) {
                    progressElement.classList.add('active');
                } else {
                    progressElement.classList.remove('active');
                }
            };

            const throttledProgress = this.throttle(updateProgress, 100);
            window.addEventListener('scroll', throttledProgress, { passive: true });
        }
    }

    toggleReadingMode() {
        this.isReadingMode = !this.isReadingMode;
        document.body.classList.toggle('reading-mode', this.isReadingMode);
        
        const readingBtn = document.querySelector('.reading-mode-btn');
        if (readingBtn) {
            readingBtn.setAttribute('aria-pressed', this.isReadingMode);
        }
        
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
            
            // Фокус на закрывающую кнопку для accessibility
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 100);
            }
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
                years: '1976-2018',
                role: 'Первый глава Донецкой Народной Республики',
                bio: 'Родился 26 июня 1976 года в Донецке. Прошёл путь от шахтёра до руководителя республики. Работал на шахте имени Засядько, участвовал в обороне Донецка с первых дней конфликта. Был избран главой ДНР в 2014 году. Погиб 31 августа 2018 года в результате теракта.',
                quotes: [
                    "Мы сделали свой выбор. И назад дороги нет.",
                    "Мы защищаем свою землю, свои семьи, свою правду.",
                    "Наша сила - в правде и в единстве.",
                    "Я обычный человек, который взял на себя ответственность."
                ],
                facts: [
                    "Работал на шахте имени Засядько",
                    "Участвовал в обороне Донецка с первых дней",
                    "Был избран главой ДНР в 2014 году",
                    "Погиб в результате теракта в 2018 году"
                ],
                values: ["Ответственность", "Верность", "Стойкость", "Патриотизм"]
            },
            motorola: {
                name: 'Арсен Павлов "Моторола"',
                years: '1983-2016', 
                role: 'Командир подразделения "Спарта"',
                bio: 'Родился 2 февраля 1983 года в Ухте. Проходил службу в морской пехоте. Один из самых известных командиров народного ополчения, прославился участием в боях за донецкий аэропорт. Стал символом сопротивления и воли к победе. Погиб 16 октября 2016 года.',
                quotes: [
                    "На войне нет времени на сомнения. Решил — делай.",
                    "Мы воюем за правду, а правда всегда побеждает.",
                    "Я обычный парень, который защищает свой дом.",
                    "Не важно, сколько врагов - важно, на чьей стороне правда."
                ],
                facts: [
                    "Проходил службу в морской пехоте",
                    "Участвовал в штурме донецкого аэропорта", 
                    "Командовал подразделением «Спарта»",
                    "Стал одним из самых известных командиров ополчения"
                ],
                values: ["Решительность", "Смелость", "Прямота", "Преданность"]
            },
            givi: {
                name: 'Михаил Толстых "Гиви"',
                years: '1980-2017',
                role: 'Командир подразделения "Сомали"', 
                bio: 'Родился 19 июля 1980 года в Иловайске. Работал водителем с 2011 по 2014 год. В начале конфликта взял в руки оружие для защиты родного города. Прославился своими искренними видеообращениями и участием в ключевых сражениях. Командовал обороной Иловайска. Погиб 8 февраля 2017 года.',
                quotes: [
                    "Мы не наёмники. Мы защищаем свои дома.",
                    "У нас нет другого выбора, кроме как победить.",
                    "Наша сила в том, что мы защищаем правду.",
                    "Я простой человек, который любит свою землю."
                ],
                facts: [
                    "Работал водителем с 2011 по 2014 год",
                    "Командовал обороной Иловайска",
                    "Возглавил подразделение «Сомали»", 
                    "Стал символом стойкости простых людей",
                    "Прославился видеообращениями с фронта"
                ],
                values: ["Простота", "Честность", "Народность", "Верность долгу"]
            }
        };
        
        const hero = heroes[heroId];
        if (hero) {
            const modalBody = document.getElementById('heroBody');
            modalBody.innerHTML = `
                <div class="hero-detail">
                    <div class="hero-header">
                        <h2>${hero.name}</h2>
                        <div class="hero-years">${hero.years}</div>
                        <div class="hero-role">${hero.role}</div>
                    </div>
                    
                    <div class="hero-bio">
                        <h3>Биография</h3>
                        <p>${hero.bio}</p>
                    </div>
                    
                    <div class="hero-values">
                        <h3>Ключевые ценности</h3>
                        <div class="values-grid">
                            ${hero.values.map(value => `
                                <span class="value-tag">${value}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="hero-quotes">
                        <h3>Ключевые цитаты</h3>
                        ${hero.quotes.map(quote => `
                            <blockquote>
                                <p>${quote}</p>
                            </blockquote>
                        `).join('')}
                    </div>
                    
                    <div class="hero-facts">
                        <h3>Факты</h3>
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
            { 
                title: 'Фото героев', 
                content: 'Архивные фотографии Моторолы, Гиви и Захарченко из разных периодов их жизни и службы.',
                items: [
                    'Официальные фотографии',
                    'Фотографии с фронта', 
                    'Личные архивные снимки',
                    'Фотографии с местными жителями'
                ]
            },
            { 
                title: 'Карты Донбасса', 
                content: 'Карты боевых действий, расположения сил и ключевых операций 2014-2022 годов.',
                items: [
                    'Карта обороны Донецка',
                    'Схема боёв за аэропорт',
                    'Карта Дебальцевской операции',
                    'Общая карта конфликта'
                ]
            },
            { 
                title: 'Документы', 
                content: 'Исторические документы, свидетельства и архивные материалы.',
                items: [
                    'Официальные документы ДНР',
                    'Личные записи героев',
                    'Исторические справки',
                    'Архивные материалы'
                ]
            },
            { 
                title: 'Видеоархив', 
                content: 'Видеообращения, хроники событий и интервью с участниками конфликта.',
                items: [
                    'Видеообращения героев',
                    'Фронтовая хроника',
                    'Интервью и воспоминания',
                    'Документальные съёмки'
                ]
            }
        ];
        
        const gallery = galleries[index];
        if (gallery) {
            const galleryBody = document.getElementById('galleryBody');
            galleryBody.innerHTML = `
                <div class="gallery-content">
                    <h2>${gallery.title}</h2>
                    <div class="gallery-description">
                        <p>${gallery.content}</p>
                    </div>
                    <div class="gallery-items">
                        <h3>Содержание раздела:</h3>
                        <ul>
                            ${gallery.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="gallery-placeholder">
                        🖼️ Раздел находится в разработке. Материалы будут добавлены в ближайшее время.
                    </div>
                </div>
            `;
            this.openModal('galleryModal');
        }
    }

    // ==================== ЦИТАТЫ ====================
    shareQuote(index) {
        const quotes = [
            "Мы сделали свой выбор. И назад дороги нет. - Александр Захарченко",
            "На войне нет времени на сомнения. Решил — делай. - Арсен Павлов («Моторола»)",
            "Мы не наёмники. Мы защищаем свои дома. У нас нет другого выбора. - Михаил Толстых («Гиви»)"
        ];
        
        const quote = quotes[index];
        
        if (navigator.share) {
            navigator.share({
                title: 'Цитата с сайта "Феномен верности"',
                text: quote,
                url: window.location.href
            }).catch(() => {
                this.copyToClipboard(quote);
            });
        } else {
            this.copyToClipboard(quote);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Цитата скопирована в буфер обмена!', 'success');
        }).catch(() => {
            this.showNotification('Не удалось скопировать цитату', 'error');
        });
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
                    
                    <p>Верность — это не просто слово в нашем лексиконе. Это фундаментальный выбор, который определяет судьбу человека, его место в истории и значение его жизни. В контексте нашего исследования верность понимается как сознательный выбор оставаться преданным своим принципам, своим товарищам и своей земле даже перед лицом смертельной опасности.</p>
                    
                    <h3>Что такое верность?</h3>
                    <p>Верность в экстремальных условиях — это не эмоция, а осознанный нравственный выбор. Это готовность пожертвовать личным благополучием ради тех ценностей, которые человек считает высшими.</p>
                    
                    <h3>Методология исследования</h3>
                    <p>Мы используем комплексный подход, сочетающий:</p>
                    <ul>
                        <li>Исторический анализ событий 2014-2022 годов</li>
                        <li>Биографические исследования ключевых фигур</li>
                        <li>Ценностный подход к пониманию мотивации</li>
                        <li>Сравнительный анализ с историческими аналогами</li>
                    </ul>
                    
                    <p>Через призму жизни и выбора конкретных людей — Александра Захарченко, Арсена Павлова (Моторолы) и Михаила Толстых (Гиви) — мы пытаемся понять универсальные механизмы человеческого поведения в экстремальных условиях.</p>
                    
                    <blockquote>
                        "В критический момент человек проявляет свою истинную сущность."
                    </blockquote>
                `
            },
            2: {
                title: "Глава 2: Исторический контекст Донбасса",
                content: `
                    <h2>Исторический контекст Донбасса</h2>
                    
                    <p>Чтобы понять выбор защитников Донбасса, необходимо погрузиться в исторический контекст региона, который веками формировал особый тип личности — человека труда, привыкшего к тяжелым условиям и ценящего прямолинейность и верность.</p>
                    
                    <h3>Донбасс: перекресток цивилизаций</h3>
                    <p>Донецкий бассейн исторически был местом встречи различных культур, традиций и мировоззрений. Этот регион сформировал особый менталитет, сочетающий:</p>
                    <ul>
                        <li>Трудовую этику шахтёров и металлургов</li>
                        <li>Интернационализм промышленного региона</li>
                        <li>Привязанность к родной земле</li>
                        <li>Прямолинейность и отсутствие лицемерия</li>
                    </ul>
                    
                    <h3>2014 год: точка невозврата</h3>
                    <p>События 2014 года стали тем рубежом, когда обычные люди были вынуждены сделать экстраординарный выбор. Это был момент истины, когда каждый должен был решить: бежать или остаться, молчать или говорить, смириться или сопротивляться.</p>
                    
                    <p>Именно в этот момент проявился тот самый "феномен верности" — готовность простых людей защищать свою землю, свои дома, свои принципы, даже понимая всю опасность этого выбора.</p>
                `
            },
            3: {
                title: "Глава 3: Феномен народного сопротивления", 
                content: `
                    <h2>Феномен народного сопротивления</h2>
                    
                    <p>Анализ мотивации простых людей, взявших в руки оружие для защиты своего дома, показывает удивительную закономерность: в основе их выбора лежали не политические убеждения, а глубинные нравственные принципы.</p>
                    
                    <h3>Мотивация защитников</h3>
                    <p>Исследование показывает, что основными мотивами были:</p>
                    <ul>
                        <li><strong>Защита дома и семьи</strong> — базовый инстинкт защиты своего гнезда</li>
                        <li><strong>Верность земле</strong> — глубокая связь с малой родиной</li>
                        <li><strong>Чувство справедливости</strong> — неприятие несправедливости происходящего</li>
                        <li><strong>Товарищество</strong> — готовность быть с друзьями в трудную минуту</li>
                    </ul>
                    
                    <h3>Психологический портрет</h3>
                    <p>Защитники Донбасса — это в основном люди:</p>
                    <ul>
                        <li>Имеющие рабочие профессии</li>
                        <li>Обладающие практическим складом ума</li>
                        <li>Ценящие прямолинейность и честность</li>
                        <li>Привыкшие к тяжелому труду и ответственности</li>
                    </ul>
                    
                    <blockquote>
                        "Когда пришла беда, у меня не было выбора — я должен был защищать свой дом." — Из интервью с участником ополчения
                    </blockquote>
                `
            },
            4: {
                title: "Глава 4: Александр Захарченко - выбор ответственности",
                content: `
                    <h2>Александр Захарченко - выбор ответственности</h2>
                    
                    <p>Путь Александра Захарченко от шахтёра до руководителя республики — это классический пример того, как в критический момент обычный человек берёт на себя extraordinary ответственность.</p>
                    
                    <h3>От шахты к руководству</h3>
                    <p>Захарченко не стремился к власти. Ситуация сама выдвинула его на первый план как человека, способного взять на себя ответственность в самый трудный момент.</p>
                    
                    <h3>Ценностный код</h3>
                    <p>Основные ценности, которые определяли его выбор:</p>
                    <ul>
                        <li><strong>Ответственность</strong> — готовность отвечать за других</li>
                        <li><strong>Верность</strong> — преданность своему народу и земле</li>
                        <li><strong>Стойкость</strong> — способность выдерживать огромное давление</li>
                        <li><strong>Патриотизм</strong> — любовь к малой родине как высшая ценность</li>
                    </ul>
                `
            },
            5: {
                title: "Глава 5: Арсен Павлов - принцип действия",
                content: `
                    <h2>Арсен Павлов - принцип действия</h2>
                    
                    <p>Феномен "Моторолы" — это пример человека действия, для которого слово не расходилось с делом. Его знаменитое "Решил — делай" стало не просто фразой, а жизненным принципом.</p>
                `
            },
            6: {
                title: "Глава 6: Михаил Толстых - символ народной воли", 
                content: `
                    <h2>Михаил Толстых - символ народной воли</h2>
                    
                    <p>Гиви стал олицетворением простого человека, который в критический момент проявил недюжинную силу духа. Его путь от водителя до командира "Сомали" показывает, как в экстремальных условиях раскрывается истинный характер человека.</p>
                    
                    <h3>Простота как сила</h3>
                    <p>Именно простота и непосредственность Гиви сделали его таким близким и понятным простым людям. Он не был профессиональным военным или политиком — он был одним из них.</p>
                `
            }
        };
        
        const chapter = chapters[chapterNumber] || chapters[1];
        const modalBody = document.getElementById('modalBody');
        const chapterTitle = document.getElementById('currentChapterTitle');
        
        chapterTitle.textContent = chapter.title;
        modalBody.innerHTML = chapter.content;
        
        this.updateChapterProgress();
        this.updateNavigationButtons();
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

    updateNavigationButtons() {
        const prevBtn = document.querySelector('.nav-button:first-child');
        const nextBtn = document.querySelector('.nav-button:last-child');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentChapter === 1;
            prevBtn.textContent = this.currentChapter === 1 ? '← Начало' : '← Предыдущая';
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentChapter === this.totalChapters;
            nextBtn.textContent = this.currentChapter === this.totalChapters ? 'Конец →' : 'Следующая →';
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
                    "Верность своим принципам, даже если это приведёт к личным потерям",
                    "Практическая польза и достижение наилучшего результата", 
                    "Безопасность и благополучие близких людей",
                    "Справедливость и честность, независимо от последствий"
                ]
            },
            {
                question: "Как бы вы поступили, если бы пришлось защищать свой дом от реальной угрозы?",
                answers: [
                    "Взял бы в руки оружие без раздумий, чтобы защитить родных и землю",
                    "Попытался бы найти мирное решение и договориться",
                    "Уехал бы в безопасное место с семьёй",
                    "Организовал бы коллективное сопротивление с соседями"
                ]
            },
            {
                question: "Что значит для вас понятие 'долг'?",
                answers: [
                    "Ответственность перед своими близкими, народом и Родиной",
                    "Выполнение взятых на себя обязательств и обещаний",
                    "Следование закону, правилам и общественным нормам",
                    "Внутреннее чувство правильного, голос совести"
                ]
            },
            {
                question: "Как вы относитесь к принципу 'Решил — делай'?",
                answers: [
                    "Это единственно правильный подход в критических ситуациях",
                    "Важно сначала всё тщательно обдумать, а потом действовать",
                    "Действовать нужно осторожно, учитывая все риски",
                    "Главное — не скорость, а правильность решения"
                ]
            },
            {
                question: "Что для вас означает 'верность'?",
                answers: [
                    "Преданность своим идеалам и близким до конца",
                    "Честность в отношениях с окружающими",
                    "Выполнение данных обещаний",
                    "Следование своим принципам в любой ситуации"
                ]
            }
        ];
        
        const container = document.getElementById('testQuestions');
        container.innerHTML = questions.map((q, index) => `
            <div class="question" id="question-${index}">
                <h3>Вопрос ${index + 1} из ${questions.length}</h3>
                <p>${q.question}</p>
                <div class="answers">
                    ${q.answers.map((answer, ansIndex) => `
                        <div class="answer" onclick="app.selectAnswer(${index}, ${ansIndex})">
                            ${answer}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('') + `
            <div class="test-actions">
                <button onclick="app.finishTest()" class="button primary" id="finishTestBtn" disabled>
                    Завершить тест
                </button>
            </div>
        `;
        
        this.testAnswers = new Array(questions.length).fill(null);
    }

    selectAnswer(questionIndex, answerIndex) {
        const answers = document.querySelectorAll(`#question-${questionIndex} .answer`);
        answers.forEach((answer, index) => {
            answer.classList.toggle('selected', index === answerIndex);
        });
        
        this.testAnswers[questionIndex] = answerIndex;
        
        // Проверяем, все ли вопросы отвечены
        const allAnswered = this.testAnswers.every(answer => answer !== null);
        const finishBtn = document.getElementById('finishTestBtn');
        if (finishBtn) {
            finishBtn.disabled = !allAnswered;
        }
    }

    finishTest() {
        const answered = this.testAnswers.filter(a => a !== null).length;
        const totalQuestions = this.testAnswers.length;
        
        if (answered < totalQuestions) {
            this.showNotification(`Ответьте на все вопросы! Осталось ${totalQuestions - answered}`, 'error');
            return;
        }
        
        document.getElementById('testQuestions').style.display = 'none';
        document.getElementById('testResult').style.display = 'block';
        
        const result = this.analyzeTestResults();
        
        document.getElementById('testResult').innerHTML = `
            <div class="result-header">
                <h3>Ваш ценностный код</h3>
                <div class="result-score">
                    Вы ответили на ${answered} из ${totalQuestions} вопросов
                </div>
            </div>
            
            <div class="result-content">
                <div class="result-type">
                    <h4>Тип личности:</h4>
                    <div class="type-badge">${result.type}</div>
                </div>
                
                <div class="result-value">
                    <h4>Основная ценность:</h4>
                    <p>${result.value}</p>
                </div>
                
                <div class="result-description">
                    <h4>Описание:</h4>
                    <p>${result.description}</p>
                </div>
                
                <div class="result-traits">
                    <h4>Характерные черты:</h4>
                    <ul>
                        ${result.traits.map(trait => `<li>${trait}</li>`).join('')}
                    </ul>
                </div>
                
                ${result.hero ? `
                <div class="result-hero">
                    <h4>Ближайший исторический аналог:</h4>
                    <div class="hero-match">
                        <strong>${result.hero.name}</strong> - ${result.hero.similarity}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="result-actions">
                <button onclick="app.restartTest()" class="button primary">Пройти тест ещё раз</button>
                <button onclick="app.shareTestResult()" class="button secondary">Поделиться результатом</button>
            </div>
        `;
        
        // Сохраняем результат
        this.saveTestResult(result);
    }

    analyzeTestResults() {
        // Простой анализ на основе преобладающих ответов
        const answerCounts = [0, 0, 0, 0];
        this.testAnswers.forEach(answer => {
            if (answer !== null) answerCounts[answer]++;
        });
        
        const maxIndex = answerCounts.indexOf(Math.max(...answerCounts));
        
        const results = [
            {
                type: "Человек верности",
                value: "Преданность и долг", 
                description: "Вы ставите верность своим принципам, идеалам и близким выше личной выгоды и комфорта. В критической ситуации способны на самопожертвование ради защиты того, что считаете важным. Ваша сила — в непоколебимости принципов.",
                traits: [
                    "Преданность идеалам",
                    "Готовность к самопожертвованию", 
                    "Непоколебимость принципов",
                    "Ответственность за других",
                    "Верность слову"
                ],
                hero: {
                    name: "Александр Захарченко",
                    similarity: "Способность брать ответственность в критический момент"
                }
            },
            {
                type: "Прагматик", 
                value: "Рациональность и практичность",
                description: "Вы руководствуетесь разумом и практической пользой. Умеете находить оптимальные решения в сложных ситуациях, взвешивая все за и против. Ваш подход помогает достигать поставленных целей с минимальными потерями.",
                traits: [
                    "Рациональное мышление",
                    "Практичность",
                    "Стратегическое планирование", 
                    "Адаптивность",
                    "Результативность"
                ],
                hero: {
                    name: "Арсен Павлов 'Моторола'", 
                    similarity: "Прямолинейность и решительность в действиях"
                }
            },
            {
                type: "Защитник",
                value: "Безопасность и стабильность", 
                description: "Ваш главный приоритет - защита близких, создание безопасной и стабильной среды. Вы надежный и ответственный человек, на которого можно положиться в трудную минуту. Семья и дом для вас - высшие ценности.",
                traits: [
                    "Заботливость", 
                    "Надёжность",
                    "Ответственность",
                    "Осторожность",
                    "Преданность семье"
                ]
            },
            {
                type: "Справедливый",
                value: "Честность и правда",
                description: "Для вас важнее всего справедливость и честность. Вы не можете мириться с несправедливостью и готовы отстаивать правду, даже если это противоречит вашим интересам. Ваша моральная чистота - ваша сила.",
                traits: [
                    "Честность",
                    "Принципиальность", 
                    "Справедливость",
                    "Прямолинейность", 
                    "Моральная стойкость"
                ],
                hero: {
                    name: "Михаил Толстых 'Гиви'",
                    similarity: "Простота и искренность в отстаивании правды"
                }
            }
        ];
        
        return results[maxIndex];
    }

    saveTestResult(result) {
        const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
        testHistory.push({
            date: new Date().toISOString(),
            result: result
        });
        localStorage.setItem('testHistory', JSON.stringify(testHistory));
    }

    shareTestResult() {
        const resultElement = document.querySelector('.result-type .type-badge');
        if (resultElement) {
            const resultText = `Мой ценностный код: ${resultElement.textContent}. Узнай свой на сайте "Феномен верности"`;
            this.shareText(resultText);
        }
    }

    shareText(text) {
        if (navigator.share) {
            navigator.share({
                text: text,
                url: window.location.href
            });
        } else {
            this.copyToClipboard(text);
        }
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

            // Валидация в реальном времени
            form.addEventListener('input', (e) => {
                this.validateField(e.target);
            });
        }
    }

    validateField(field) {
        const errorElement = field.parentNode.querySelector('.error-message');
        
        if (field.value.trim() === '') {
            this.showFieldError(field, 'Это поле обязательно для заполнения');
            return false;
        }
        
        if (field.type === 'email' && !this.isValidEmail(field.value)) {
            this.showFieldError(field, 'Введите корректный email адрес');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        field.classList.add('error');
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('error');
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            message: formData.get('message').trim()
        };
        
        // Валидация всех полей
        let isValid = true;
        ['name', 'email', 'message'].forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showNotification('Исправьте ошибки в форме', 'error');
            return;
        }
        
        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
        
        // Имитация отправки
        setTimeout(() => {
            this.showNotification('Сообщение отправлено! Спасибо за обратную связь.', 'success');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Сохраняем в историю
            this.saveContactMessage(data);
        }, 1500);
    }

    saveContactMessage(data) {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push({
            ...data,
            date: new Date().toISOString(),
            id: Date.now()
        });
        localStorage.setItem('contactMessages', JSON.stringify(messages));
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
                star.classList.add('active');
                star.style.opacity = '1';
            } else {
                star.classList.remove('active');
                star.style.opacity = '0.3';
            }
        });
        
        // Обновляем средний рейтинг
        this.updateAverageRating(rating);
        
        this.showNotification(`Спасибо за оценку ${rating} звезд!`, 'success');
        localStorage.setItem('bookRating', rating);
    }

    updateAverageRating(newRating) {
        const ratings = JSON.parse(localStorage.getItem('allRatings') || '[]');
        ratings.push(newRating);
        localStorage.setItem('allRatings', JSON.stringify(ratings));
        
        const average = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
        const averageElement = document.getElementById('averageRating');
        if (averageElement) {
            averageElement.textContent = average;
        }
    }

    // ==================== УВЕДОМЛЕНИЯ ====================
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            // Автоматическое скрытие
            setTimeout(() => {
                notification.style.display = 'none';
            }, type === 'error' ? 5000 : 3000);
        }
    }

    // ==================== УТИЛИТЫ ====================
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==================== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ====================
    exportToPDF() {
        this.showNotification('Функция экспорта в PDF будет доступна в ближайшее время!', 'info');
    }

    startAudioBook() {
        this.showNotification('Аудиоверсия книги готовится к выпуску! Следите за обновлениями.', 'info');
    }

    showPrivacyPolicy() {
        this.showNotification('Политика конфиденциальности будет размещена в этом разделе.', 'info');
    }

    exportUserData() {
        const userData = {
            theme: this.currentTheme,
            favorites: JSON.parse(localStorage.getItem('quoteFavorites') || '[]'),
            rating: localStorage.getItem('bookRating'),
            testHistory: JSON.parse(localStorage.getItem('testHistory') || '[]'),
            contactMessages: JSON.parse(localStorage.getItem('contactMessages') || '[]'),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'fenomen-vernosti-user-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Данные успешно экспортированы!', 'success');
    }

    clearProgress() {
        if (confirm('Вы уверены, что хотите очистить весь прогресс? Это действие нельзя отменить.')) {
            localStorage.removeItem('quoteFavorites');
            localStorage.removeItem('bookRating');
            localStorage.removeItem('allRatings');
            localStorage.removeItem('testHistory');
            localStorage.removeItem('contactMessages');
            
            // Сбрасываем рейтинг
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => {
                star.classList.remove('active');
                star.style.opacity = '0.3';
            });
            
            const averageElement = document.getElementById('averageRating');
            if (averageElement) {
                averageElement.textContent = '4.8';
            }
            
            this.showNotification('Весь прогресс успешно очищен!', 'success');
        }
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
        
        // Восстанавливаем средний рейтинг
        const ratings = JSON.parse(localStorage.getItem('allRatings') || '[]');
        if (ratings.length > 0) {
            const average = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
            const averageElement = document.getElementById('averageRating');
            if (averageElement) {
                averageElement.textContent = average;
            }
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
    
    // Добавляем класс загрузки для плавного появления
    document.body.classList.add('loaded');
});
