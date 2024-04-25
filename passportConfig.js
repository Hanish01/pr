const LocalStrategy = require("passport-local").Strategy;
const { pool } = require('./dbConfig');
const bcrypt = require('bcrypt');

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        pool.query(
            `SELECT * FROM projects WHERE email = $1`,
            [email],
            (err, res) => {
                try {
                    if (err) {
                        throw err;
                    }

                    if (res.rows.length > 0) {
                        const user = res.rows[0];
                        bcrypt.compare(password, user.password, (err, match) => {
                            if (err) {
                                throw err;
                            }
                            if (match) {
                                return done(null, user);
                            } else {
                                return done(null, false, { message: "Password is not correct" });
                            }
                        });
                    } else {
                        return done(null, false, { message: "Email not registered" });
                    }
                } catch (error) {
                    return done(error);
                }
            }
        );
    };

    passport.use(new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        authenticateUser
    ));

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        pool.query(`SELECT * FROM projects WHERE id = $1`, [id], (err, res) => {
            
                if (err) {
                    throw err;
                    }
            
                return done(null, res.rows[0]);
            
        });
    });
}

module.exports = initialize;
