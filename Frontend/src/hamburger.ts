(function() {
    let hamburger: HTMLElement = document.getElementById('main-nav-hamburger');
    let nav: HTMLElement = document.getElementsByTagName('nav')[0];
    let hamburgerOpen: boolean = false;
    hamburger.addEventListener('click', (e: MouseEvent)=>{
        e.preventDefault();
        if (hamburgerOpen) {
            hamburgerOpen = false;
            window.scrollTo(0,0);
            nav.classList.remove('open');
        } else {
            hamburgerOpen = true;
            window.scrollTo(0,0);
            nav.classList.add('open');
        }
    })
})();