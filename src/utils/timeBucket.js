function getTimeBucket(timestamp) {
  const hour = new Date(timestamp).getHours(); // gives 0-23
  if(hour >=5 && hour < 12){
    return "morning";
  }
  else if(hour >= 12 && hour <16){
    return "afternoon";
  } 
  else if(hour >=16 && hour <21){
    return "evening";
  }
  else{
    return "lateNight"
  }
}

export{getTimeBucket};