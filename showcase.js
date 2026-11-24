(() => {
 const tabs = [...document.querySelectorAll('[data-preview]')];
 function select(button) {
   for (const tab of tabs) {
     const active = tab === button;
     tab.setAttribute('aria-pressed', String(active));
     const panel = document.getElementById(tab.getAttribute('aria-controls'));
     if (panel) panel.hidden = !active;
   }
 }
 tabs.forEach(button => button.addEventListener('click', () => select(button)));
})();
