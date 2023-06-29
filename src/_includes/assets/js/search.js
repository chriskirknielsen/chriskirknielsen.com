(()=>{var o=document.getElementById("searchform"),i=document.getElementById("q"),u=document.getElementById("results"),s=null;async function c(){return s!==null?s:await fetch("/search.json").then(e=>e.json()).then(e=>(s=e,e))}var d=async()=>{u.innerHTML='<li class="u-color-grey-med">Loading\u2026</li>';let e=i.value.toLowerCase().trim();if(e.length<=0)return;let r=new RegExp(`${e}`,"gi"),a="",l=(await c()).filter(t=>r.test(t.title)||r.test(t.tags.join(" ")));l.length===0&&(a="<li>No results found \u{1F622}</li>"),l.sort((t,n)=>new Date(n.date)-new Date(t.date)),l.forEach(t=>{let n=new Date(t.date).toISOString().split("T").shift();a+=`
			<li>
				<time datetime="${n}" class="u-color-aux-med u-fontSize-smallest u-fontVariant-tabularNums">${n}</time>
				<a href="${t.url}" hreflang="${t.lang}">${t.title}</a>
				<span class="u-color-gray-med">(${t.lang})</span>
			</li>
		`}),setTimeout(()=>{u.innerHTML=a},100)};o.addEventListener("submit",function(e){return e.preventDefault(),d(),!1});})();
