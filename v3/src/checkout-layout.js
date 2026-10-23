// All checkout and service counters now face north (-Y), where staff
// operate the computer. Shoppers visit from the south (+Y) side.
export const checkoutStaffPosition=counter=>({x:counter.x+Math.round((counter.w-1)/2),y:counter.y-1});
export const checkoutCustomerPosition=counter=>({x:counter.x+Math.round((counter.w-1)/2),y:counter.y+(counter.h||1)});
export function checkoutFacingIsCorrect(counter,staff,customer){
 return staff.x>=counter.x&&staff.x<counter.x+counter.w&&
  customer.x>=counter.x&&customer.x<counter.x+counter.w&&
  staff.y<counter.y&&customer.y>=counter.y+(counter.h||1);
}
