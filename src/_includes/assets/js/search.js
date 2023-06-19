(()=>{var o=document.getElementById("searchform"),u=document.getElementById("q"),r=document.getElementById("results"),l=null;async function c(){return l!==null?l:await fetch("/search.json").then(t=>t.json()).then(t=>(l=t,t))}var d=async()=>{r.innerHTML='<li class="postlist-post">Loading\u2026</li>';let t=u.value.toLowerCase().trim();if(t.length<=0)return;let a=new RegExp(`${t}`,"gi"),n="",s=(await c()).filter(e=>a.test(e.title)||a.test(e.tags.join(" ")));s.length===0&&(n='<li class="postlist-post">No results found \u{1F622}</li>'),s.sort((e,i)=>new Date(i.date)-new Date(e.date)),s.forEach(e=>{n+=`
			<li class="postlist-post">
				<h3 class="h4">
					<a href="${e.url}" class="heading-link" hreflang="${e.lang}">${e.title}</a>
				</h3>
			</li>
		`}),setTimeout(()=>{r.innerHTML=n},100)};o.addEventListener("submit",function(t){return t.preventDefault(),d(),!1});})();
