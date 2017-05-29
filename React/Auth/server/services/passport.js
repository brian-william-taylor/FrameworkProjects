const passport = require('passport');
const config = require('../config');
const User = require('../models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

//Create local strategy
const localOptions = { usernameField: 'email' }
const localLogin = new LocalStrategy(localOptions, function(email, password, done){
    //Verify this email and password, call done with user 
    // if it is the correct email and password
    //otherwise call done with false

    User.findOne({email: email}, function(err,user){
        if (err){
            return done(err,false);
        }

        if(!user){
            return done(null,false);
        }

        //compare passwords
        user.comparePassword(password, function(err, isMatch){
            if (err){return done(err);}
            if (!isMatch){return done(null, false)}

            return done(null, user);
        })
    });
});


//Creat JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
    //See if the user ID in the payload exists in our database
    // If it does, call 'done' with that other 
    // Otherwuse
    User.findById(payload.sub, function(err, user){
        if (err){
            return done(err,false);
        }

        if(user){
            done(null, user);
        }
        else{
            done(null, false);
        }



    });
});

//Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);