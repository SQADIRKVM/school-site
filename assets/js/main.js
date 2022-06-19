(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 20
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function(direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-carousel', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-wrap',
        layoutMode: 'fitRows'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  });

})()

let activeIndex = 0;
let limit = 0;
let disabled = false;
let $stage;
let $controls;
let canvas = false;

const SPIN_FORWARD_CLASS = 'js-spin-fwd';
const SPIN_BACKWARD_CLASS = 'js-spin-bwd';
const DISABLE_TRANSITIONS_CLASS = 'js-transitions-disabled';
const SPIN_DUR = 1000;

const appendControls = () => {
  for (let i = 0; i < limit; i++) {if (window.CP.shouldStopExecution(0)) break;
    $('.carousel__control').append(`<a href="#" data-index="${i}"></a>`);
  }window.CP.exitedLoop(0);
  let height = $('.carousel__control').children().last().outerHeight();

  $('.carousel__control').css('height', 30 + limit * height);
  $controls = $('.carousel__control').children();
  $controls.eq(activeIndex).addClass('active');
};

const setIndexes = () => {
  $('.spinner').children().each((i, el) => {
    $(el).attr('data-index', i);
    limit++;
  });
};

const duplicateSpinner = () => {
  const $el = $('.spinner').parent();
  const html = $('.spinner').parent().html();
  $el.append(html);
  $('.spinner').last().addClass('spinner--right');
  $('.spinner--right').removeClass('spinner--left');
};

const paintFaces = () => {
  $('.spinner__face').each((i, el) => {
    const $el = $(el);
    let color = $(el).attr('data-bg');
    $el.children().css('backgroundImage', `url(${getBase64PixelByColor(color)})`);
  });
};

const getBase64PixelByColor = hex => {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.height = 1;
    canvas.width = 1;
  }
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 1, 1);
    return canvas.toDataURL();
  }
  return false;
};

const prepareDom = () => {
  setIndexes();
  paintFaces();
  duplicateSpinner();
  appendControls();
};

const spin = (inc = 1) => {
  if (disabled) return;
  if (!inc) return;
  activeIndex += inc;
  disabled = true;

  if (activeIndex >= limit) {
    activeIndex = 0;
  }

  if (activeIndex < 0) {
    activeIndex = limit - 1;
  }

  const $activeEls = $('.spinner__face.js-active');
  const $nextEls = $(`.spinner__face[data-index=${activeIndex}]`);
  $nextEls.addClass('js-next');

  if (inc > 0) {
    $stage.addClass(SPIN_FORWARD_CLASS);
  } else {
    $stage.addClass(SPIN_BACKWARD_CLASS);
  }

  $controls.removeClass('active');
  $controls.eq(activeIndex).addClass('active');

  setTimeout(() => {
    spinCallback(inc);
  }, SPIN_DUR, inc);
};

const spinCallback = inc => {

  $('.js-active').removeClass('js-active');
  $('.js-next').removeClass('js-next').addClass('js-active');
  $stage.
  addClass(DISABLE_TRANSITIONS_CLASS).
  removeClass(SPIN_FORWARD_CLASS).
  removeClass(SPIN_BACKWARD_CLASS);

  $('.js-active').each((i, el) => {
    const $el = $(el);
    $el.prependTo($el.parent());
  });
  setTimeout(() => {
    $stage.removeClass(DISABLE_TRANSITIONS_CLASS);
    disabled = false;
  }, 100);

};

const attachListeners = () => {

  document.onkeyup = e => {
    switch (e.keyCode) {
      case 38:
        spin(-1);
        break;
      case 40:
        spin(1);
        break;}

  };

  $controls.on('click', e => {
    e.preventDefault();
    if (disabled) return;
    const $el = $(e.target);
    const toIndex = parseInt($el.attr('data-index'), 10);
    spin(toIndex - activeIndex);

  });
};

const assignEls = () => {
  $stage = $('.carousel__stage');
};

const init = () => {
  assignEls();
  prepareDom();
  attachListeners();
};


$(() => {
  init();
});