const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { Users } = require('../models');
const { JWT_SECRET } = require('../config');

passport.use('signup', new localStrategy({
  usernameField : 'userName',
  passwordField : 'password'
}, async (userName, password, done) => {
    try {
      const user = await Users.create({ userName, password });
      return done(null, user);
    } catch (error) {
      done(error);
    }
}));

passport.use('login', new localStrategy({
  usernameField : 'userName',
  passwordField : 'password'
}, async (userName, password, done) => {
  try {
    const user = await Users.findOne({ userName });
    if( !user ){
      return done(null, false, { message : 'User not found'});
    }

    const validate = await user.isValidPassword(password);
    if( !validate ){
      return done(null, false, { message : 'Wrong Password'});
    }
    return done(null, user, { message : 'Logged in Successfully'});
  } catch (error) {
    return done(error);
  }
}));

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(new JWTstrategy({
  secretOrKey : 'test',
  jwtFromRequest : ExtractJWT.fromUrlQueryParameter('secret_token')
}, async (token, done) => {
  try {
    return done(null, token.user);
  } catch (error) {
    done(error);
  }
}));