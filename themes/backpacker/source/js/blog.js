$(document).ready(() => {
    let menu = $('.auto-hide')[0];
    menu.style.visibility = 'hidden';
    
    $(window).scroll((e) => {
        if (window.scrollY === 0)
            menu.style.visibility = 'hidden';
        else
            menu.style.visibility = 'visible';
    })
});