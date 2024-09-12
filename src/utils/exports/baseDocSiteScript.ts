export let baseDocSiteScript = `
    window.onload = function(){

    const drawer = mdc.drawer.MDCDrawer.attachTo(document.getElementById('nav-drawer'));

    const topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.getElementById('app-bar'));
    //topAppBar.setScrollTarget(document.querySelector<HTMLElement>('.ed-body'));
    topAppBar.listen('MDCTopAppBar:nav', () => {
      drawer.open = !drawer.open;});

    const listEl = document.getElementById('nav-drawer');
      
    const mainContentEl = document.querySelector<HTMLElement>('.ed-body');
    }
`;
