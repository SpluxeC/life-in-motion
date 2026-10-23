// Shared physical merchandise catalog for hardware-store departments.
// Every value is an existing gameplay item ID from simulation.js / drawItem.
export const DEPARTMENT_PRODUCTS=Object.freeze({
 PAINT:Object.freeze(['paint','gloves','broom']),
 TOOLS:Object.freeze(['hammer','wrench','broom','flashlight']),
 ELECTRICAL:Object.freeze(['flashlight','phone']),
 PLUMBING:Object.freeze(['wrench','gloves','water']),
 HARDWARE:Object.freeze(['hammer','wrench','gloves','flashlight'])
});
export const departmentProducts=department=>DEPARTMENT_PRODUCTS[department]||DEPARTMENT_PRODUCTS.HARDWARE;
export function departmentItem(department,index=0){
 const products=departmentProducts(department);
 return products[((Math.floor(index)%products.length)+products.length)%products.length];
}
export function visibleShelfCount(stock,capacity=12,positions=14){
 if(stock===undefined||stock===null)return positions;
 const ratio=Math.min(1,Math.max(0,Number(stock)/Math.max(1,Number(capacity)||12)));
 return Math.round(positions*ratio);
}
