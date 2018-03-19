const displayDuration = (duration) => {
  const mins = Math.floor(duration / 60);
  let seconds = duration % 60;

  if (seconds === 0) {
    seconds = '00';
  } else if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${mins}:${seconds}`;
};

export default displayDuration;
