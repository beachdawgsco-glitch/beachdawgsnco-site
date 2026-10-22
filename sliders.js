document.querySelectorAll('.compare input').forEach(input=>{
 const frame=input.closest('.compare');
 const left=frame.querySelector('.left').textContent,right=frame.querySelector('.right').textContent;
 input.addEventListener('input',()=>{frame.style.setProperty('--split',input.value+'%');input.setAttribute('aria-valuetext',`${input.value} percent ${left}, ${100-input.value} percent ${right}`)});
});
document.querySelectorAll('.carousel').forEach(carousel=>{
 const track=carousel.querySelector('.carousel-track'),slides=[...track.children],buttons=carousel.querySelectorAll('button');
 const step=()=>slides[0].getBoundingClientRect().width+20;
 const current=()=>Math.round(track.scrollLeft/step());
 function update(){const index=current();carousel.querySelector('.carousel-status').textContent=`${index+1} / ${slides.length}`;buttons[0].disabled=track.scrollLeft<=2;buttons[1].disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;}
 buttons.forEach(button=>button.addEventListener('click',()=>track.scrollBy({left:Number(button.dataset.direction)*step(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})));
 track.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();track.scrollBy({left:(e.key==='ArrowRight'?1:-1)*step(),behavior:'smooth'})}});
});
