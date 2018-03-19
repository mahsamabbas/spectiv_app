function submitApplication(e) {
  e.preventDefault();

  const technology = document.getElementById('technology').value.trim();
  const explain = document.getElementById('explain').value.trim();
  let yesNo;
  if (document.getElementById('yes').checked) {
    yesNo = 'Yes';
  } else if (document.getElementById('no').checked) {
    yesNo = 'No';
  }

  if (!technology || !yesNo || !explain) {
    alert('You can\'t leave any question blank!');
  } else {
    axios({
      method: 'POST',
      url: '/apply',
      data: {
        technology,
        yesNo,
        explain,
      },
    }).then(() => {
      alert('You application has been submitted!');
      location.reload();
    }).catch((err) => {
      alert(err.response.data.message);
    });
  }
}
