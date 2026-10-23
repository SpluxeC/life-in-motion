// Hardware store register lane: the POS computer faces the cashier on the
// south (+Y) side. Shoppers queue at the opposite north (-Y) side.
// Coordinates are walkable world tiles, not decorative collision footprints.
export const checkoutStaffPosition=counter=>({x:counter.x+Math.round((counter.w-1)/2),y:counter.y+1});
export const checkoutCustomerPosition=counter=>({x:counter.x+Math.round((counter.w-1)/2),y:counter.y-1});
export function checkoutFacingIsCorrect(counter,staff,customer){
 return staff.x>=counter.x&&staff.x<counter.x+counter.w&&
  customer.x>=counter.x&&customer.x<counter.x+counter.w&&
  staff.y>=counter.y+(counter.h||1)&&customer.y<counter.y;
}
