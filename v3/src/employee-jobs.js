// Eight distinct primary positions. Coverage never rewrites primaryJob.
export const JOBS=['Cashier','Service Associate','Sales Associate','Stocker','Lumber Associate','Receiving Associate','Maintenance','Store Manager'];
export function assignPrimaryJobs(employees){
 const counts=new Map(JOBS.map(j=>[j,0])),pending=[];
 // Preserve existing distinct positions after loading saves.
 for(const n of employees){
  const j=n.primaryJob;
  if(JOBS.includes(j)&&counts.get(j)===0)counts.set(j,1);
  else pending.push(n);
 }
 for(const n of pending){
  const available=JOBS.filter(j=>j!=='Store Manager'||counts.get(j)===0);
  const job=available.sort((a,b)=>counts.get(a)-counts.get(b)||JOBS.indexOf(a)-JOBS.indexOf(b))[0];
  n.primaryJob=job;counts.set(job,counts.get(job)+1);
 }
 return employees;
}
export function assignCoverage(employees){
 const active=employees.filter(n=>n.alive&&!n.arrested&&n.unconscious<=0&&(n.panic||0)<=0);
 for(const n of employees)n.coveringJob=null;
 for(const [job,duty] of [['Cashier','cashier'],['Service Associate','service']]){
  if(active.some(n=>n.primaryJob===job||n.coveringJob===job))continue;
  const substitute=active.filter(n=>!n.coveringJob&&!['Cashier','Service Associate'].includes(n.primaryJob))
    .sort((a,b)=>(a.primaryJob==='Sales Associate'?0:a.primaryJob==='Store Manager'?2:1)-
      (b.primaryJob==='Sales Associate'?0:b.primaryJob==='Store Manager'?2:1))[0];
  if(substitute)substitute.coveringJob=job;
 }
 return active;
}
export function effectiveDuty(n){const job=n.coveringJob||n.primaryJob;return job==='Cashier'?'cashier':job==='Service Associate'?'service':'floor'}
