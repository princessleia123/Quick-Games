window.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();event.stopImmediatePropagation();document.querySelector('#playButton')?.click()}},{capture:true});
