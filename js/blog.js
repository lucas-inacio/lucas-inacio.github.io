function hideSideBar() {
    $('div[data-parent="#sidebar-accordion"]').removeClass('show');
}

$(document).ready(() => {
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