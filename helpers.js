/* Finds all the URLs made by the user and adds them to a variable that will be used to print them all.
userID: the id that belongs to the user who is logged in.
urlDatabase: the entire database of URLs for every registered account.
*/
const findURLbyID = function(userID, urlDatabase) {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};


/* Used to find a user ID with their matching email.
email: the email used to find a match in the database.
userDatabase: the entire database of users who have registered accounts.
*/
const findID = function(email, userDatabase) {
  for (let id in userDatabase) {
    //console.log(id);
    if (email === userDatabase[id].email) {
      //console.log("LOOK HERE: " + id);
      return id;
    }
  }
};

// Generates a random 6-character string for the new short URL.
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return str;
};

/* Checks if an email is already attached to a user in the "database".
newEmail: an email that the user is trying to use to register a new account.
*/
const emailChecker = function(newEmail, users) {
  for (let key in users) {
    if (users[key].email === newEmail) {
      return true;
    }
  }
  return false;
};

module.exports = {findURLbyID, findID, generateRandomString, emailChecker};