// Neev Prototype — copy/screenshot protection
// Raises the barrier against casual copying. Not bulletproof against dev tools experts.

(function(){
  // 1. Screen blackout when OS screenshot tools steal focus (Snipping Tool, Win+Shift+S)
  window.addEventListener('blur', function(){
    document.body.classList.add('protected-screen');
  });
  window.addEventListener('focus', function(){
    document.body.classList.remove('protected-screen');
  });

  // 2. Intercept PrintScreen key — clear clipboard + temporary blackout
  window.addEventListener('keyup', function(e){
    if(e.key === 'PrintScreen'){
      if(navigator.clipboard) navigator.clipboard.writeText('');
      document.body.classList.add('protected-screen');
      setTimeout(function(){ document.body.classList.remove('protected-screen'); }, 2000);
    }
  });

  // 3. Block right-click context menu
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });

  // 4. Block keyboard shortcuts: Ctrl+S, Ctrl+P, Ctrl+U, F12, Ctrl+Shift+I/J/C
  document.addEventListener('keydown', function(e){
    if(e.key === 'F12') { e.preventDefault(); return; }
    if(e.ctrlKey && ['s','p','u'].includes(e.key.toLowerCase())) { e.preventDefault(); return; }
    if(e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase())) { e.preventDefault(); return; }
  });

  // 5. Disable text selection & drag
  document.addEventListener('selectstart', function(e){ e.preventDefault(); });
  document.addEventListener('dragstart', function(e){ e.preventDefault(); });

  // 6. Console warning
  console.log('%c⛔ STOP', 'color:red;font-size:48px;font-weight:bold;');
  console.log('%cThis is a confidential prototype. Unauthorized copying or distribution is prohibited.', 'color:red;font-size:16px;');
})();
