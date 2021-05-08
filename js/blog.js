function hideSideBar() {
    $('.auto-hide-click').each(function () {
        $(this).addClass('collapsed');
        this.setAttribute('aria-expanded', 'false');
    });

    $('div[data-parent="#sidebar-accordion"]').removeClass('show');
}

$(document).ready(() => {
    let menu = $('.auto-hide')[0];
    menu.style.visibility = 'hidden';
    
    $(document).scroll((e) => {
        if (window.scrollY === 0) {
            menu.style.visibility = 'hidden';
        }
        else
            menu.style.visibility = 'visible';
    
        hideSideBar();
    });

    window.addEventListener(
        'click',
        (e) => {
            let sidebar = $('#sidebar-accordion').first();
            let pos = sidebar.position();
            let width = sidebar.outerWidth();
            let height = sidebar.outerHeight();
            if (e.clientX < pos.left || e.clientX > pos.left + width ||
                e.clientY < pos.top || e.clientY > pos.top + height) {

                hideSideBar();
            }
        },
        true
    );
});