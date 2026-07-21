const videos = document.querySelectorAll('.project-video');

const stopVideo = (video) => {
    if (!video) return;

    video.pause();
    video.classList.remove('is-previewing');

    try {
        video.currentTime = 0;
    } catch (error) {
    }
};

const playVideo = (video) => {
    if (!video || !video.currentSrc && !video.src) return;

    try {
        video.currentTime = 0;
    } catch (error) {
    }

    video.classList.add('is-previewing');
    const playRequest = video.play();

    if (playRequest) {
        playRequest.catch(() => {
            stopVideo(video);
        });
    }
};

videos.forEach((video) => {
    const card = video.closest('.video-card');
    const media = video.closest('.project-media');
    const poster = video.getAttribute('poster');

    if (media && poster && !media.querySelector('.project-thumbnail')) {
        const thumbnail = document.createElement('img');
        thumbnail.className = 'project-thumbnail';
        thumbnail.src = poster;
        thumbnail.alt = '';
        thumbnail.setAttribute('aria-hidden', 'true');
        video.insertAdjacentElement('afterend', thumbnail);
    }

    if (!card) return;

    card.addEventListener('mouseenter', () => playVideo(video));
    card.addEventListener('mouseleave', () => stopVideo(video));
    card.addEventListener('focusin', () => playVideo(video));
    card.addEventListener('focusout', () => stopVideo(video));
});

const categoryTabs = document.querySelectorAll('[data-category-filter]');
const projectCards = document.querySelectorAll('[data-project-category]');
const projectShowcase = document.querySelector('#project-showcase');
const scrollButtons = document.querySelectorAll('[data-scroll-projects]');

let projectCategoryTimer = null;

const showProjectCategory = (category) => {
    if (projectCategoryTimer) {
        window.clearTimeout(projectCategoryTimer);
    }

    categoryTabs.forEach((tab) => {
        const isActive = tab.dataset.categoryFilter === category;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
    });

    if (projectShowcase) {
        projectShowcase.classList.add('is-switching');
    }

    projectCards.forEach((card) => {
        card.classList.remove('is-revealing');
    });

    projectCategoryTimer = window.setTimeout(() => {
        let revealIndex = 0;

        projectCards.forEach((card) => {
            const isVisible = card.dataset.projectCategory === category;
            const video = card.querySelector('.project-video');

            if (!isVisible && video) {
                stopVideo(video);
            }

            card.hidden = !isVisible;

            if (isVisible) {
                card.style.setProperty('--reveal-index', revealIndex);
                revealIndex += 1;

                window.requestAnimationFrame(() => {
                    card.classList.add('is-revealing');
                });
            }
        });

        if (projectShowcase) {
            projectShowcase.scrollTo({ left: 0, behavior: 'smooth' });
            projectShowcase.classList.remove('is-switching');
        }
    }, 140);
};

categoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        showProjectCategory(tab.dataset.categoryFilter);
    });
});

scrollButtons.forEach((button) => {
    button.addEventListener('click', () => {
        if (!projectShowcase) return;

        const direction = Number(button.dataset.scrollProjects || 1);
        const distance = Math.max(projectShowcase.clientWidth * 0.82, 280);

        projectShowcase.scrollBy({
            left: direction * distance,
            behavior: 'smooth'
        });
    });
});

const videoModal = document.querySelector('#video-modal');
const modalVideo = document.querySelector('#modal-video');
const modalTitle = document.querySelector('#video-modal-title');
const closeVideoButtons = document.querySelectorAll('[data-close-video]');
const playableCards = document.querySelectorAll('[data-video-src]');
let lastFocusedProject = null;
const stopPreviewVideos = () => {
    videos.forEach((video) => stopVideo(video));
};

const openProjectVideo = (card) => {
    if (!videoModal || !modalVideo || !card) return;

    const source = card.dataset.videoSrc;
    const title = card.dataset.videoTitle || 'Project Video';
    const previewVideo = card.querySelector('.project-video');
    const poster = previewVideo ? previewVideo.getAttribute('poster') : '';

    if (!source) return;

    lastFocusedProject = document.activeElement instanceof HTMLElement ? document.activeElement : card;
    card.classList.add('is-clicked');
    window.setTimeout(() => card.classList.remove('is-clicked'), 220);
    stopPreviewVideos();

    if (modalTitle) {
        modalTitle.textContent = title;
    }

    if (poster) {
        modalVideo.poster = poster;
    } else {
        modalVideo.removeAttribute('poster');
    }

    modalVideo.src = source;
    videoModal.hidden = false;
    videoModal.classList.add('is-opening');
    document.body.classList.add('modal-open');
    modalVideo.load();

    const playRequest = modalVideo.play();
    if (playRequest) {
        playRequest.catch(() => {
            modalVideo.controls = true;
        });
    }
    window.setTimeout(() => videoModal.classList.remove('is-opening'), 260);

    const closeButton = videoModal.querySelector('.modal-close');
    if (closeButton) closeButton.focus();
};

const closeProjectVideo = () => {
    if (!videoModal || !modalVideo) return;

    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.removeAttribute('poster');
    modalVideo.load();
    videoModal.hidden = true;
    videoModal.classList.remove('is-opening');
    document.body.classList.remove('modal-open');
    stopPreviewVideos();

    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }

    if (lastFocusedProject && typeof lastFocusedProject.blur === 'function') {
        lastFocusedProject.blur();
    }

    lastFocusedProject = null;
};

playableCards.forEach((card) => {
    card.addEventListener('click', () => openProjectVideo(card));
    card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        openProjectVideo(card);
    });
});

closeVideoButtons.forEach((button) => {
    button.addEventListener('click', closeProjectVideo);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && videoModal && !videoModal.hidden) {
        closeProjectVideo();
    }
});

const navToggle = document.querySelector('#nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach((link) => {
    const blurNavLink = () => {
        link.blur();
    };

    const closeMobileMenu = () => {
        if (navToggle) navToggle.checked = false;
        blurNavLink();
    };

    link.addEventListener('click', () => {
        window.setTimeout(closeMobileMenu, 0);
    });

    link.addEventListener('pointerup', blurNavLink);
    link.addEventListener('pointercancel', blurNavLink);
    link.addEventListener('pointerleave', blurNavLink);
    link.addEventListener('dragstart', blurNavLink);
});
const pageTransitionLinks = document.querySelectorAll('a[href]');

const normalizePortfolioPath = (pathname) => {
    let normalizedPath = pathname.replace(/\\/g, '/');

    normalizedPath = normalizedPath
        .replace(/\/index\.html$/i, '/')
        .replace(/\.html$/i, '')
        .replace(/\/$/, '');

    return normalizedPath || '/';
};

pageTransitionLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target && link.target !== '_self') return;

        const rawHref = link.getAttribute('href');
        if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;

        const destination = new URL(rawHref, window.location.href);
        if (destination.origin !== window.location.origin) return;

        const currentPath = normalizePortfolioPath(window.location.pathname);
        const destinationPath = normalizePortfolioPath(destination.pathname);
        const isSamePage = destinationPath === currentPath && destination.hash === window.location.hash;

        if (isSamePage) {
            event.preventDefault();
            if (navToggle) navToggle.checked = false;
            return;
        }

        if (destinationPath === currentPath && destination.hash) return;

        event.preventDefault();

        try {
            sessionStorage.setItem('portfolioSkipLoader', '1');
        } catch (error) {
        }

        document.body.classList.add('page-transition-out');

        window.setTimeout(() => {
            window.location.href = destination.href;
        }, 210);
    });
});

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const message = String(formData.get('message') || '').trim();

        if (!name || !email || !message) {
            if (formStatus) formStatus.textContent = 'Please complete all fields before sending.';
            return;
        }

        if (formStatus) formStatus.textContent = 'Sending your message...';
        contactForm.classList.add('is-sending');

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Message service failed');
            }

            contactForm.reset();
            if (formStatus) {
                formStatus.textContent = 'Message sent. Thank you for reaching out.';
            }
        } catch (error) {
            const subject = encodeURIComponent(`Portfolio message from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            window.location.href = `mailto:delrosariokielcarlo@gmail.com?subject=${subject}&body=${body}`;

            if (formStatus) {
                formStatus.textContent = 'If sending is blocked, your email app will open instead.';
            }
        } finally {
            contactForm.classList.remove('is-sending');
        }
    });
}
const loaderStartedAt = Date.now();
const minimumLoaderTime = 1500;
const shouldShowLoader = document.documentElement.classList.contains('show-loader');

if (!shouldShowLoader) {
    document.body.classList.add('is-loaded');
}

window.addEventListener('load', () => {
    if (!shouldShowLoader) return;

    const elapsed = Date.now() - loaderStartedAt;
    const remainingTime = Math.max(minimumLoaderTime - elapsed, 0);

    window.setTimeout(() => {
        document.body.classList.add('is-loaded');
    }, remainingTime);
});
