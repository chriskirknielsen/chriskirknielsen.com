(()=>{var y=document.getElementById("searchform"),E=document.getElementById("q"),l=document.getElementById("results"),p=document.getElementById("search-result-item"),T=document.getElementById("search-results-heading"),h=document.getElementById("search-results-count"),i=null;async function b(){return i!==null?i:fetch("/search.json").then(e=>e.json()).then(e=>(i=e,e))}var o=e=>e.replace(/(‘|’)/,"'"),I=async()=>{let e=o(E.value.toLowerCase().trim());if(e.length<=0)return;y.setAttribute("data-state","changed"),T.hidden=!1,l.innerHTML="<li>Loading\u2026</li>";let a=(await b()).filter(t=>o(t.title.toLowerCase()).includes(e)||o(t.summary.toLowerCase()).includes(e)||o(t.tags.join(" ").toLowerCase()).includes(e));setTimeout(()=>{if(a.length===0){h.innerText="(0)",l.innerHTML="<li>No results found \u{1F622}</li>";return}let t=new DocumentFragment;l.innerHTML="",a.forEach(n=>{let d=n.type,r=p.content.cloneNode(!0),g=r.querySelector("[data-result-type]"),w=r.querySelector("[data-result-info]"),u=r.querySelector("time[datetime]"),c=r.querySelector("a[href]"),m=r.querySelector("[data-lang-code]"),f=new Date(n.date).toISOString().split("T").shift(),s="";switch(d){case"_fonts":s="Typeface";break;case"_designs":s="Design";break;case"_projects":s="Project";break;case"_posts":default:s="Blogpost";break}g.innerText=`${s}`,c.setAttribute("href",n.url),c.setAttribute("hreflang",n.lang),c.innerHTML=n.title,d==="_posts"?(u.setAttribute("datetime",f),u.innerText=f,m.innerText=`(${n.lang})`):(u.hidden=!0,m.hidden=!0),t.append(r)}),h.innerText=`(${a.length})`,l.append(t)},100)};y.addEventListener("submit",function(e){return e.preventDefault(),I(),!1});})();
