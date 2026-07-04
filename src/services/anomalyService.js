function calculateZScore(amount, avgAmount, stdDev) {
    if(stdDev === 0){
        return null;
    }
    return (amount -avgAmount)/stdDev;
}

function checkNoveltyRisk(amount, avgTransactionAmount, relationshipExists) {
  if(avgTransactionAmount === 0) return false;
  if( !relationshipExists && amount > (3*avgTransactionAmount))return true;
  return false;
}

// bucketPercentage is expressed as a decimal (0-1), e.g. 0.05 = 5%
function checkTimeAnomalyRisk(bucketPercentage, hasHistory) {
  if (!hasHistory) return false;
  if (bucketPercentage < 0.05) return true;
  return false;
}

function calculateAnomalyScore(zScore, noveltyRisk, timeAnomalyRisk) {
  let totalScore = 0;
  const reasons = [];

  if (zScore !== null && Math.abs(zScore) > 3) {
    totalScore += 50;
    reasons.push("Unusual transaction amount for this user");
  }

  if (noveltyRisk) {
    totalScore += 30;
    reasons.push("Large payment to a new receiver");
  }

  if (timeAnomalyRisk) {
    totalScore += 20;
    reasons.push("Unusual transaction time for this user");
  }

  return {
    riskScore: totalScore,
    flagged: totalScore >= 50,
    reasons: reasons,
  };
}

export { calculateAnomalyScore,checkNoveltyRisk,calculateZScore,checkTimeAnomalyRisk };