// ========================================
// DOM要素の取得
// ========================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const header = document.getElementById('header');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contact-form');
const portfolioFilters = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');
const processSteps = document.querySelectorAll('.process-step');
const skillBars = document.querySelectorAll('.skill-progress');
const statNumbers = document.querySelectorAll('.stat-number');

// ========================================
// ユーティリティ関数
// ========================================
function debounce(func, wait) {
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

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function isElementPartiallyInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= windowHeight &&
        rect.left <= windowWidth
    );
}

// ========================================
// ナビゲーション関連
// ========================================
class Navigation {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleScroll();
    }

    bindEvents() {
        // ハンバーガーメニューのトグル
        hamburger?.addEventListener('click', () => this.toggleMenu());

        // ナビリンクのクリック処理
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // スクロール時のヘッダー処理
        window.addEventListener('scroll', debounce(() => this.handleScroll(), 10));

        // メニュー外クリック時の閉じる処理
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        navMenu?.classList.toggle('active', this.isMenuOpen);
        hamburger?.classList.toggle('active', this.isMenuOpen);
        
        // ハンバーガーアイコンのアニメーション
        const spans = hamburger?.querySelectorAll('span');
        spans?.forEach((span, index) => {
            if (this.isMenuOpen) {
                switch(index) {
                    case 0:
                        span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                        break;
                    case 1:
                        span.style.opacity = '0';
                        break;
                    case 2:
                        span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                        break;
                }
            } else {
                span.style.transform = '';
                span.style.opacity = '';
            }
        });
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = header?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }

        // モバイルメニューを閉じる
        if (this.isMenuOpen) {
            this.toggleMenu();
        }
    }

    handleScroll() {
        if (!header) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // ヘッダーの背景透明度調整
        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '';
        }

        // アクティブなセクションのハイライト
        this.updateActiveNavLink();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink?.classList.add('active');
            }
        });
    }

    handleOutsideClick(e) {
        if (this.isMenuOpen && !navMenu?.contains(e.target) && !hamburger?.contains(e.target)) {
            this.toggleMenu();
        }
    }
}

// ========================================
// ポートフォリオフィルター
// ========================================
class PortfolioFilter {
    constructor() {
        this.activeFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        portfolioFilters.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
    }

    handleFilterClick(e) {
        const filter = e.target.getAttribute('data-filter');
        
        if (filter === this.activeFilter) return;

        this.activeFilter = filter;
        this.updateActiveButton(e.target);
        this.filterItems(filter);
    }

    updateActiveButton(activeBtn) {
        portfolioFilters.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    filterItems(filter) {
        portfolioItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;

            // アニメーション付きで表示/非表示
            setTimeout(() => {
                if (shouldShow) {
                    item.classList.remove('hidden');
                    item.classList.add('visible');
                } else {
                    item.classList.add('hidden');
                    item.classList.remove('visible');
                }
            }, index * 100);
        });
    }
}

// ========================================
// アニメーション処理
// ========================================
class AnimationController {
    constructor() {
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.observeElements();
        this.handleScroll();
        window.addEventListener('scroll', debounce(() => this.handleScroll(), 50));
    }

    observeElements() {
        // フェードインアニメーション要素の設定
        const elementsToAnimate = [
            { selector: '.section-title', class: 'fade-in' },
            { selector: '.about-text', class: 'slide-in-left' },
            { selector: '.work-process', class: 'slide-in-right' },
            { selector: '.skill-category', class: 'fade-in' },
            { selector: '.portfolio-item', class: 'fade-in' },
            { selector: '.contact-info', class: 'slide-in-left' },
            { selector: '.contact-form-container', class: 'slide-in-right' }
        ];

        elementsToAnimate.forEach(({ selector, class: className }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.classList.add(className);
            });
        });
    }

    handleScroll() {
        const animationElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
        
        animationElements.forEach(el => {
            if (isElementPartiallyInViewport(el) && !this.animatedElements.has(el)) {
                el.classList.add('visible');
                this.animatedElements.add(el);
                
                // スキルバーの特別処理
                if (el.closest('.skills')) {
                    this.animateSkillBars();
                }
                
                // 統計数字のカウントアップ
                if (el.closest('.stats')) {
                    this.animateStatNumbers();
                }
            }
        });
    }

    animateSkillBars() {
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
                bar.classList.add('animate');
            }, index * 200);
        });
    }

    animateStatNumbers() {
        statNumbers.forEach(stat => {
            if (this.animatedElements.has(stat)) return;
            
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current);
            }, 16);

            this.animatedElements.add(stat);
        });
    }
}

// ========================================
// プロセスステップのインタラクション
// ========================================
class ProcessStepController {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = processSteps.length;
        this.init();
    }

    init() {
        this.bindEvents();
        this.startAutoStep();
    }

    bindEvents() {
        processSteps.forEach(step => {
            step.addEventListener('click', (e) => this.handleStepClick(e));
            step.addEventListener('mouseenter', () => this.pauseAutoStep());
            step.addEventListener('mouseleave', () => this.resumeAutoStep());
        });
    }

    handleStepClick(e) {
        const stepNumber = parseInt(e.currentTarget.getAttribute('data-step'));
        this.setActiveStep(stepNumber);
    }

    setActiveStep(stepNumber) {
        processSteps.forEach(step => step.classList.remove('active'));
        const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
        targetStep?.classList.add('active');
        this.currentStep = stepNumber;
    }

    startAutoStep() {
        this.autoStepInterval = setInterval(() => {
            this.currentStep = this.currentStep >= this.totalSteps ? 1 : this.currentStep + 1;
            this.setActiveStep(this.currentStep);
        }, 3000);
    }

    pauseAutoStep() {
        clearInterval(this.autoStepInterval);
    }

    resumeAutoStep() {
        this.startAutoStep();
    }
}

// ========================================
// コンタクトフォーム処理
// ========================================
class ContactFormController {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        contactForm?.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // リアルタイムバリデーション
        const inputs = contactForm?.querySelectorAll('input, textarea, select');
        inputs?.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearFieldError(e.target));
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.showSubmitLoading();
        
        // 実際の送信処理をシミュレート
        setTimeout(() => {
            this.showSubmitSuccess();
            this.resetForm();
        }, 2000);
    }

    validateForm() {
        const requiredFields = contactForm?.querySelectorAll('[required]');
        let isValid = true;

        requiredFields?.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // 必須チェック
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'この項目は必須です';
            isValid = false;
        }

        // メールアドレスの形式チェック
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = '正しいメールアドレスを入力してください';
                isValid = false;
            }
        }

        // エラー表示の更新
        this.updateFieldError(field, errorMessage);
        return isValid;
    }

    updateFieldError(field, errorMessage) {
        // 既存のエラーメッセージを削除
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (errorMessage) {
            // エラーメッセージを作成して表示
            const errorElement = document.createElement('span');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            errorElement.style.color = '#ef4444';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '4px';
            errorElement.style.display = 'block';
            
            field.parentNode.appendChild(errorElement);
            field.style.borderColor = '#ef4444';
        } else {
            field.style.borderColor = '';
        }
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
            field.style.borderColor = '';
        }
    }

    showSubmitLoading() {
        const submitBtn = contactForm?.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '送信中...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        }
    }

    showSubmitSuccess() {
        const submitBtn = contactForm?.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '送信完了！';
            submitBtn.style.background = '#10b981';
            
            setTimeout(() => {
                submitBtn.textContent = 'メッセージを送信';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
                submitBtn.style.background = '';
            }, 3000);
        }

        // 成功メッセージの表示
        this.showNotification('メッセージを送信しました。24時間以内にご連絡いたします。', 'success');
    }

    showNotification(message, type = 'info') {
        // 既存の通知を削除
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // スタイリング
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        });

        // タイプ別の背景色
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // アニメーション
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自動削除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    resetForm() {
        contactForm?.reset();
        
        // エラーメッセージをクリア
        const errorElements = contactForm?.querySelectorAll('.field-error');
        errorElements?.forEach(error => error.remove());
        
        // フィールドのスタイルをリセット
        const fields = contactForm?.querySelectorAll('input, textarea, select');
        fields?.forEach(field => {
            field.style.borderColor = '';
        });
    }
}

// ========================================
// スムーススクロール強化
// ========================================
class SmoothScrollController {
    constructor() {
        this.init();
    }

    init() {
        // すべての内部リンクにスムーススクロールを適用
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // スクロールインジケーターの処理
        const scrollIndicator = document.querySelector('.scroll-indicator');
        scrollIndicator?.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                this.scrollToElement(aboutSection);
            }
        });
    }

    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            this.scrollToElement(targetElement);
        }
    }

    scrollToElement(element) {
        const headerHeight = header?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ========================================
// パフォーマンス最適化
// ========================================
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
        this.optimizeAnimations();
    }

    lazyLoadImages() {
        // 画像の遅延読み込み（実装例）
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    preloadCriticalResources() {
        // 重要なリソースのプリロード
        const criticalResources = [
            // 例: '/images/hero-bg.jpg',
            // 例: '/fonts/custom-font.woff2'
        ];

        criticalResources.forEach(resource => {
            try {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                link.as = resource.includes('.woff') ? 'font' : 'image';
                if (link.as === 'font') {
                    link.crossOrigin = 'anonymous';
                }
                document.head.appendChild(link);
            } catch (e) {
                console.warn('リソースのプリロードに失敗:', resource);
            }
        });
    }

    optimizeAnimations() {
        // アニメーションのパフォーマンス最適化
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
        
        // will-change プロパティの動的設定
        animatedElements.forEach(el => {
            // transitionstart イベントがサポートされていない場合の対策
            const events = ['transitionstart', 'animationstart'];
            events.forEach(eventName => {
                el.addEventListener(eventName, () => {
                    el.style.willChange = 'transform, opacity';
                }, { once: true });
            });
            
            const endEvents = ['transitionend', 'animationend'];
            endEvents.forEach(eventName => {
                el.addEventListener(eventName, () => {
                    el.style.willChange = 'auto';
                }, { once: true });
            });
        });
    }
}

// ========================================
// テーマ切り替え（ダークモード） - localStorage使用不可のため修正
// ========================================
class ThemeController {
    constructor() {
        this.currentTheme = 'light'; // デフォルトはライトテーマ
        this.init();
    }

    init() {
        this.applyTheme();
        this.createThemeToggle();
    }

    createThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', 'テーマを切り替え');
        
        // スタイリング
        Object.assign(themeToggle.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--primary-color)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: '1000',
            transition: 'all 0.3s ease'
        });

        themeToggle.addEventListener('click', () => this.toggleTheme());
        themeToggle.addEventListener('mouseenter', () => {
            themeToggle.style.transform = 'scale(1.1)';
        });
        themeToggle.addEventListener('mouseleave', () => {
            themeToggle.style.transform = 'scale(1)';
        });

        document.body.appendChild(themeToggle);
        this.themeToggle = themeToggle;
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        
        if (this.themeToggle) {
            this.themeToggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    applyTheme() {
        if (this.currentTheme === 'dark') {
            document.documentElement.style.setProperty('--text-dark', '#f9fafb');
            document.documentElement.style.setProperty('--text-light', '#d1d5db');
            document.documentElement.style.setProperty('--bg-light', '#1f2937');
            document.documentElement.style.setProperty('--text-white', '#111827');
            document.documentElement.style.setProperty('--border-color', '#374151');
        } else {
            document.documentElement.style.setProperty('--text-dark', '#1f2937');
            document.documentElement.style.setProperty('--text-light', '#6b7280');
            document.documentElement.style.setProperty('--bg-light', '#f9fafb');
            document.documentElement.style.setProperty('--text-white', '#ffffff');
            document.documentElement.style.setProperty('--border-color', '#e5e7eb');
        }
    }
}

// ========================================
// 初期化とイベントリスナーの設定
// ========================================
class App {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // DOM読み込み完了後に初期化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // 各コンポーネントの初期化
            this.components.navigation = new Navigation();
            this.components.portfolioFilter = new PortfolioFilter();
            this.components.animationController = new AnimationController();
            this.components.processStepController = new ProcessStepController();
            this.components.contactFormController = new ContactFormController();
            this.components.smoothScrollController = new SmoothScrollController();
            this.components.performanceOptimizer = new PerformanceOptimizer();
            this.components.themeController = new ThemeController();

            // 初期化完了のログ
            console.log('🎉 フリーランスWebデザイナーサイトが正常に初期化されました');
            
            // パフォーマンス測定
            this.measurePerformance();
            
        } catch (error) {
            console.error('❌ 初期化中にエラーが発生しました:', error);
        }
    }

    measurePerformance() {
        // ページロード時間の測定
        window.addEventListener('load', () => {
            try {
                const loadTime = performance.now();
                console.log(`⚡ ページロード時間: ${loadTime.toFixed(2)}ms`);
                
                // Performance API が利用可能な場合のみ実行
                if (window.performance && window.performance.getEntriesByType) {
                    const navigationEntries = window.performance.getEntriesByType('navigation');
                    if (navigationEntries.length > 0) {
                        console.log('📊 ナビゲーション情報:', navigationEntries[0]);
                    }
                }
            } catch (e) {
                console.log('⚡ ページが読み込まれました');
            }
        });
    }
}

// ========================================
// アプリケーションの開始
// ========================================
const app = new App();

// ========================================
// エラーハンドリング
// ========================================
window.addEventListener('error', (event) => {
    console.error('💥 JavaScript エラー:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 未処理のPromise拒否:', event.reason);
});

// ========================================
// パフォーマンス監視
// ========================================
if ('PerformanceObserver' in window) {
    try {
        // Long Task の監視
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                    console.warn(`⚠️ 長時間実行タスク検出: ${entry.duration.toFixed(2)}ms`);
                }
            }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
        // ブラウザがサポートしていない場合は無視
        console.log('📊 PerformanceObserver は利用できません');
    }
}

// ========================================
// 開発者向けユーティリティ
// ========================================
// 開発環境の検出（process オブジェクトを使用しない方法）
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('dev');

if (isDevelopment) {
    // 開発環境でのみ実行されるコード
    window.debugApp = {
        components: () => app.components,
        performance: () => {
            try {
                return performance.getEntriesByType('navigation');
            } catch (e) {
                return [];
            }
        },
        theme: (themeName) => {
            if (app.components.themeController) {
                app.components.themeController.currentTheme = themeName;
                app.components.themeController.applyTheme();
            }
        }
    };
    
    console.log('🔧 開発者モード: window.debugApp でデバッグ機能を利用できます');
}