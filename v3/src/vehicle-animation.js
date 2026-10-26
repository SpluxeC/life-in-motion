// Phase 5: simulation-synchronized emergency vehicle light patterns.
// Render-only, deterministic and compatible with older saved vehicle objects.
export function emergencyVehicleVisual(vehicle={},elapsed=0){
 if(!vehicle.emergency)return null;
 const speed=Number.isFinite(elapsed)?elapsed:0;
 const phase=Math.floor(Math.max(0,speed)*5)%2;
 const role=vehicle.color==='#b9594d'?'fire':vehicle.color==='#668ba9'?'police':'medical';
 return Object.freeze({role,phase,left:phase===0?'#ff625a':'#25425a',right:phase===1?'#75bdff':'#25425a',active:vehicle.targetX!==undefined&&Math.hypot((vehicle.targetX||0)-(vehicle.x||0),(vehicle.targetY||0)-(vehicle.y||0))>.1});
}
export function vehicleMotionState(vehicle={}){
 const dx=(vehicle.targetX??vehicle.x??0)-(vehicle.x??0),dy=(vehicle.targetY??vehicle.y??0)-(vehicle.y??0);
 return Object.freeze({moving:Math.hypot(dx,dy)>.04,heading:Math.atan2(dy,dx)});
}
