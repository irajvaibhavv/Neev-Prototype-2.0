// Neev Employer Portal — employee score: experience + salary + feedback, informational only (HR still decides manually).
function monthsSinceJoined(joinedStr){
  const d = new Date(joinedStr);
  if(isNaN(d)) return 12;
  const now = new Date('2026-08-31');
  return Math.max(0, (now.getFullYear()-d.getFullYear())*12 + (now.getMonth()-d.getMonth()));
}
function experienceScore(emp){
  return Math.min(40, Math.round((monthsSinceJoined(emp.joined)/36)*40)); // 3 years tenure = full 40 pts
}
function salaryScore(emp){
  return Math.min(30, Math.round((emp.salary/25000)*30));
}
function feedbackScore(emp){
  return Math.round(((emp.rating||3)/5)*30);
}
function employeeScore(emp){
  return experienceScore(emp)+salaryScore(emp)+feedbackScore(emp);
}
function scoreLabel(score){
  if(score>=80) return {label:'Excellent', color:'var(--ok)'};
  if(score>=60) return {label:'Good', color:'var(--t7)'};
  if(score>=40) return {label:'Average', color:'var(--m6)'};
  return {label:'Needs review', color:'var(--err)'};
}

// ===== BRANCH HEALTH — aggregates employeeScore() per branch, shown only for branches the viewer can see =====
function branchStats(branch){
  const emps=EMPS.filter(e=>e.branch===branch);
  const activeLoans=emps.filter(e=>e.loan&&e.loan.status==='Active');
  const outstanding=activeLoans.reduce((a,e)=>a+e.loan.amount,0);
  const avgScore = emps.length ? Math.round(emps.reduce((a,e)=>a+employeeScore(e),0)/emps.length) : 0;
  return { branch, empCount:emps.length, activeLoanCount:activeLoans.length, outstanding, avgScore };
}
function branchHealthLabel(avgScore){
  if(avgScore>=70) return {label:'Healthy', color:'var(--ok)'};
  if(avgScore>=50) return {label:'Watch', color:'var(--m6)'};
  return {label:'At risk', color:'var(--err)'};
}
