module.exports = (agent, user) => (
  agent.post('/authenticate')
    .send({
      username: user.username,
      password: user.password,
    }).then(response => response.body)
);
