// In-place HUD reconciler. Preserve existing button nodes, hover state,
// pointer targets and keyboard focus when frequently refreshing simulation data.
export function patchPanelHTML(container, html){
 if(!container||container.innerHTML===html)return;
 const staging=document.createElement('div');
 staging.innerHTML=html;
 function syncChildren(parent, nextParent){
  const incoming=Array.from(nextParent.childNodes);
  for(let index=0;index<incoming.length;index++){
   const fresh=incoming[index],old=parent.childNodes[index];
   if(!old){parent.appendChild(fresh);continue}
   if(old.nodeType!==fresh.nodeType||old.nodeType===1&&(
      old.namespaceURI!==fresh.namespaceURI||old.localName!==fresh.localName)){
    parent.replaceChild(fresh,old);continue;
   }
   if(old.nodeType===3||old.nodeType===8){
    if(old.nodeValue!==fresh.nodeValue)old.nodeValue=fresh.nodeValue;
    continue;
   }
   if(old.nodeType===1){
    for(const attr of Array.from(old.attributes)){
     if(!fresh.hasAttribute(attr.name))old.removeAttribute(attr.name);
    }
    for(const attr of Array.from(fresh.attributes)){
     if(old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
    }
    syncChildren(old,fresh);
   }
  }
  while(parent.childNodes.length>incoming.length)parent.removeChild(parent.lastChild);
 }
 syncChildren(container,staging);
}
