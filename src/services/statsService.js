function updateUserStats(oldAvg,oldCount,oldM2,newAmount){
    const newCount = oldCount+1;
    const delta = newAmount-oldAvg;
    const newAvg = oldAvg+delta/newCount;
    const delta2 = newAmount- newAvg;
    const newM2 = oldM2 + delta*delta2;
    const newStd = Math.sqrt(newM2/newCount);

    return{ 
       newStd:newStd,
       newM2:newM2,
       newCount:newCount,
       newAvg:newAvg
    };
}


export{updateUserStats};
