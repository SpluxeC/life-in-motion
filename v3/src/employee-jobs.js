// Eight distinct primary positions. Coverage never rewrites primaryJob.
export const JOBS=['Cashier','Service Associate','Sales Associate','Stocker','Lumber Associate','Receiving Associate','Maintenance','Store Manager'];
export function assignPrimaryJobs(employees){
 const counts=new Map(JOBS.map(j=>[j,0]));
 for(const n of employees){
  let job=n.primaryJob;
  if(!JOBS.includes(job)||job==='Store Manager'&&counts.get(job)>0){
   job=JOBS.filter(j=>j!=='Store Manager'||counts.get(j)===0)
     .sort((a,b)=>counts.get(a)-counts.get(b)||JOBS.indexOf(a)-JOBS.indexOf(b))[0];
  }
  n.primaryJob=job;counts.set(job,counts.get(job)+1);
 }
 return employees;
}
export function assignCoverage(employees){
 const active=employees.filter(n=>n.alive&&!n.arrested&&n.unconscious<=0);
 for(const n of employees)n.coveringJob=null;
 for(const [job,duty] of [['Cashier','cashier'],['Service Associate','service']]){
  if(active.some(n=>n.primaryJob===job||n.coveringJob===job))continue;
  const substitute=active.filter(n=>!n.coveringJob&&n.primaryJob!=='Store Manager')
    .sort((a,b)=>(a.primaryJob==='Sales Associate'?0:1)-(b.primaryJob==='Sales Associate'?0:1))[0];
  if(substitute)substitute.coveringJob=job;
 }
 return active;
}
export function effectiveDuty(n){const job=n.coveringJob||n.primaryJob;return job==='Cashier'?'cashier':job==='Service Associate'?'service':'floor'}
