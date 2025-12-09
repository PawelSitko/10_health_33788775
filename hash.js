const bcrypt = require('bcrypt');
const saltRounds = 10;

bcrypt.hash('smiths123ABC$', saltRounds, (err, hash) => {
  if (err) throw err;
  console.log(hash);
});
