// Typing Animation - Website-focused
const typingTexts = [
    'useful',
    'custom',
    'fun',
    'simple',
    'informative',
    'clean',
    'interactive'
];

let currentTextIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;

function typeText() {
    const typingElement = document.querySelector('.typing-text');
    const currentText = typingTexts[currentTextIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
    } else {
        typingElement.textContent = currentText.substring(0, currentCharIndex + 1);
        currentCharIndex++;
    }
    
    if (!isDeleting && currentCharIndex === currentText.length) {
        setTimeout(() => { isDeleting = true; }, 2000);
    } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % typingTexts.length;
    }
    
    const speed = isDeleting ? 100 : 200;
    setTimeout(typeText, speed);
}

// Start typing animation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeText, 1000);
});

// Magnetic Button Effect
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px) scale(1)';
    });
});

// Subtle Hover Effect for Project Cards - More Subtle
document.querySelectorAll('[data-tilt]').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-3px) rotateX(0.5deg) rotateY(0.3deg)';
        element.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg)';
    });
});

// Custom Cursor (keep stable without toggling hover scale/color on links/buttons)
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursorFollower.style.left = e.clientX + 'px';
    cursorFollower.style.top = e.clientY + 'px';
});

// Horizontal Projects Scroll - Lazy Susan Effect
class ProjectsScroll {
    constructor() {
        this.track = document.querySelector('.projects-track');
        this.cards = document.querySelectorAll('.project-card');
        this.dots = document.querySelectorAll('.dot');
        this.currentIndex = 0;
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = 0;
        this.cardWidth = 0;
        this.gap = 48; // 3rem gap between cards
        
        this.init();
    }
    
    init() {
        this.setupCards();
        this.setupDots();
        this.setupScrollHints();
        this.setupNavigationArrows();
        this.setupTouchEvents();
        this.setupKeyboardEvents();
        this.updateDots();
        this.centerCurrentCard();
    }
    
    setupCards() {
        // Calculate card width including gap
        this.cardWidth = this.cards[0].offsetWidth + this.gap;
        
        // Add smooth scroll behavior
        this.track.style.scrollBehavior = 'smooth';
        
        // Add grab cursor styles
        this.cards.forEach(card => {
            card.addEventListener('mousedown', this.startDragging.bind(this));
            card.addEventListener('touchstart', this.startDragging.bind(this));
        });
    }
    
    setupDots() {
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToCard(index);
            });
        });
    }
    
    setupScrollHints() {
        const leftHint = document.querySelector('.left-hint');
        const rightHint = document.querySelector('.right-hint');
        
        if (leftHint) {
            leftHint.addEventListener('click', () => {
                this.previousCard();
            });
        }
        
        if (rightHint) {
            rightHint.addEventListener('click', () => {
                this.nextCard();
            });
        }
    }
    
    setupNavigationArrows() {
        const prevArrow = document.getElementById('prevProject');
        const nextArrow = document.getElementById('nextProject');
        
        if (prevArrow) {
            prevArrow.addEventListener('click', () => {
                this.previousCard();
            });
        }
        
        if (nextArrow) {
            nextArrow.addEventListener('click', () => {
                this.nextCard();
            });
        }
    }
    
    setupTouchEvents() {
        // Touch events for mobile
        this.track.addEventListener('touchstart', this.startDragging.bind(this));
        this.track.addEventListener('touchmove', this.drag.bind(this));
        this.track.addEventListener('touchend', this.endDragging.bind(this));
        
        // Mouse events for desktop
        this.track.addEventListener('mousedown', this.startDragging.bind(this));
        this.track.addEventListener('mousemove', this.drag.bind(this));
        this.track.addEventListener('mouseup', this.endDragging.bind(this));
        this.track.addEventListener('mouseleave', this.endDragging.bind(this));
        
        // Prevent context menu
        this.track.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousCard();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextCard();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToCard(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToCard(this.cards.length - 1);
                    break;
            }
        });
    }
    
    startDragging(e) {
        this.isDragging = true;
        this.startPos = this.getPositionX(e);
        this.animationID = requestAnimationFrame(this.animation.bind(this));
        
        // Do not toggle native cursor style; it is hidden globally
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const currentPosition = this.getPositionX(e);
        const diff = currentPosition - this.startPos;
        const moveX = this.prevTranslate + diff;
        
        // Limit scrolling
        const maxTranslate = 0;
        const minTranslate = -(this.cards.length - 1) * this.cardWidth;
        
        if (moveX > maxTranslate || moveX < minTranslate) {
            return;
        }
        
        this.currentTranslate = moveX;
        this.track.style.transform = `translateX(${moveX}px)`;
    }
    
    endDragging() {
        this.isDragging = false;
        cancelAnimationFrame(this.animationID);
        
        // Do not toggle native cursor style; it is hidden globally
        
        // Snap to nearest card
        const movedBy = this.currentTranslate - this.prevTranslate;
        
        if (Math.abs(movedBy) > this.cardWidth / 3) {
            if (movedBy < 0) {
                this.nextCard();
            } else {
                this.previousCard();
            }
        } else {
            this.goToCard(this.currentIndex);
        }
    }
    
    getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }
    
    animation() {
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }
    
    goToCard(index) {
        if (index < 0 || index >= this.cards.length) return;
        
        this.currentIndex = index;
        this.currentTranslate = -index * this.cardWidth;
        this.prevTranslate = this.currentTranslate;
        
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
        this.updateDots();
        this.centerCurrentCard();
    }
    
    nextCard() {
        if (this.currentIndex < this.cards.length - 1) {
            this.goToCard(this.currentIndex + 1);
        }
    }
    
    previousCard() {
        if (this.currentIndex > 0) {
            this.goToCard(this.currentIndex - 1);
        }
    }
    
    updateDots() {
        this.dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    centerCurrentCard() {
        // Add smooth animation for centering
        this.track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            this.track.style.transition = '';
        }, 600);
    }
    
    // Auto-scroll functionality (optional)
    startAutoScroll() {
        this.autoScrollInterval = setInterval(() => {
            if (this.currentIndex < this.cards.length - 1) {
                this.nextCard();
            } else {
                this.goToCard(0);
            }
        }, 5000);
    }
    
    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
        }
    }
}

// Initialize projects scroll
let projectsScroll;

document.addEventListener('DOMContentLoaded', () => {
    projectsScroll = new ProjectsScroll();
    
    // Optional: Start auto-scroll on page load
    // projectsScroll.startAutoScroll();
    
    // Stop auto-scroll when user interacts
    document.addEventListener('mousemove', () => {
        if (projectsScroll) {
            projectsScroll.stopAutoScroll();
        }
    });
});

// Ensure GitHub opens in a new tab via attributes (no click interception)
document.addEventListener('DOMContentLoaded', () => {
    const githubLink = document.querySelector('.contact a[href^="https://github.com/"]');
    if (githubLink) {
        githubLink.setAttribute('target', '_blank');
        githubLink.setAttribute('rel', 'noopener');

        // Hide custom cursor when hovering GitHub button
        githubLink.addEventListener('mouseenter', () => {
            if (cursorFollower) {
                cursorFollower.style.opacity = '0';
            }
        });
        githubLink.addEventListener('mouseleave', () => {
            if (cursorFollower) {
                cursorFollower.style.opacity = '1';
            }
        });
    }
});

// Render email text into an image via canvas to reduce scraping
document.addEventListener('DOMContentLoaded', () => {
    const img = document.getElementById('emailImage');
    if (!img) return;

    const email = 'adammoffat30@gmail.com';
    const paddingX = 20; // px
    const paddingY = 12; // px
    const font = "20px 'JetBrains Mono', monospace";

    // Measure text
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = font;
    const metrics = measureCtx.measureText(email);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = 24; // approx for 20px font

    const canvas = document.createElement('canvas');
    canvas.width = textWidth + paddingX * 2;
    canvas.height = textHeight + paddingY * 2;
    const ctx = canvas.getContext('2d');

    // Background black to blend with page
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

    // Text
    ctx.font = font;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(email, paddingX, canvas.height / 2);

    // Set as image src
    img.src = canvas.toDataURL('image/png');
    img.dataset.emailToken = btoa(email);
});

// Copy email button logic with visual feedback, without exposing plain text
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('copyEmailBtn');
    const feedback = document.getElementById('copyEmailFeedback');
    const img = document.getElementById('emailImage');
    if (!btn || !feedback || !img) return;

    btn.addEventListener('click', async () => {
        try {
            const encoded = img.dataset.emailToken;
            if (!encoded) return;
            const email = atob(encoded);
            await navigator.clipboard.writeText(email);

            // Feedback UI
            const original = btn.textContent;
            btn.textContent = '✓ Copied';
            feedback.textContent = '';
            btn.style.borderColor = '#22c55e';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            }, 1500);
        } catch (err) {
            const original = btn.textContent;
            btn.textContent = 'Error';
            feedback.textContent = '';
            setTimeout(() => { btn.textContent = original; }, 1200);
        }
    });
});

// Smooth Scroll with Parallax
const sections = document.querySelectorAll('section');
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    
    sections.forEach((section, index) => {
        const speed = (index + 1) * 0.05;
        const yPos = -(scrolled * speed);
        section.style.transform = `translateY(${yPos}px)`;
    });
    
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Add staggered animation for project cards
            if (entry.target.classList.contains('project-card')) {
                const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 200;
                entry.target.style.transitionDelay = delay + 'ms';
            }
        }
    });
}, observerOptions);

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    // Set initial states
    const animatedElements = document.querySelectorAll('.project-card, .contact-card');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(element);
    });
});

// Floating Orbs Interaction
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.orb');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.3;
        const x = (mouseX - 0.5) * speed * 30;
        const y = (mouseY - 0.5) * speed * 30;
        
        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Grid Lines Animation
function animateGridLines() {
    const gridLines = document.querySelector('.grid-lines');
    let offset = 0;
    
    function updateGrid() {
        offset += 0.3;
        gridLines.style.transform = `translate(${offset}px, ${offset}px)`;
        requestAnimationFrame(updateGrid);
    }
    
    updateGrid();
}

// Start grid animation
animateGridLines();

// Minimal particle effects
function createParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '1px';
    particle.style.height = '1px';
    particle.style.background = 'rgba(255, 255, 255, 0.3)';
    particle.style.borderRadius = '0';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = Math.random() * window.innerHeight + 'px';
    particle.style.animation = 'particle 4s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 4000);
}

// Add particle animation CSS
const particleCSS = `
    @keyframes particle {
        0% { 
            opacity: 0; 
            transform: scale(0); 
        }
        50% { 
            opacity: 1; 
            transform: scale(1); 
        }
        100% { 
            opacity: 0; 
            transform: scale(0); 
        }
    }
`;

if (!document.querySelector('#particle-style')) {
    const style = document.createElement('style');
    style.id = 'particle-style';
    style.textContent = particleCSS;
    document.head.appendChild(style);
}

// Create particles periodically
setInterval(createParticle, 8000);

// Performance Optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
    requestTick();
}, 16));

// Loading Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1s ease-in';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        
        // Add entrance animation for hero elements
        const heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 500 + index * 200);
        });
    }, 100);
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
            e.preventDefault();
            window.scrollBy({
                top: window.innerHeight,
                behavior: 'smooth'
            });
            break;
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            window.scrollBy({
                top: -window.innerHeight,
                behavior: 'smooth'
            });
            break;
        case 'Home':
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            break;
        case 'End':
            e.preventDefault();
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            break;
    }
});

// Add focus styles for accessibility
document.querySelectorAll('a, button, [data-tilt]').forEach(element => {
    element.addEventListener('focus', () => {
        element.style.outline = '2px solid rgba(255, 255, 255, 0.6)';
        element.style.outlineOffset = '3px';
    });
    
    element.addEventListener('blur', () => {
        element.style.outline = 'none';
    });
});

// Project Card Hover Effects
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        // Add subtle glow effect
        card.style.boxShadow = '0 40px 100px rgba(0, 0, 0, 0.5), 0 0 50px rgba(255, 255, 255, 0.1)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '0 40px 100px rgba(0, 0, 0, 0.5)';
    });
});

// Smooth reveal for project features
document.querySelectorAll('.feature').forEach((feature, index) => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateX(-20px)';
    feature.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    
    setTimeout(() => {
        feature.style.opacity = '1';
        feature.style.transform = 'translateX(0)';
    }, 1000 + index * 100);
});

// Easter Egg: Konami Code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Trigger special effect
        document.body.style.animation = 'rainbow 2s infinite';
        
        // Add rainbow animation CSS
        const rainbowCSS = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        
        if (!document.querySelector('#rainbow-style')) {
            const style = document.createElement('style');
            style.id = 'rainbow-style';
            style.textContent = rainbowCSS;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            document.body.style.animation = 'none';
        }, 5000);
        
        konamiCode = [];
    }
});

// Scroll to Section Function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}
