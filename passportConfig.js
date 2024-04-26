const LocalStrategy = require("passport-local").Strategy;
const { pool } = require('./dbConfig');
const bcrypt = require('bcrypt');

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM projects WHERE email = $1`,
                [email]
            );
            
            if (rows.length === 0) {
                return done(null, false, { message: "Email not registered" });
            }

            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password is not correct" });
            }
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        authenticateUser
    ));

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser(async (id, done) => {
        try {
            const { rows } = await pool.query(`SELECT * FROM projects WHERE id = $1`, [id]);
            if (rows.length === 0) {
                return done(new Error('User not found'));
            }
            return done(null, rows[0]);
        } catch (error) {
            return done(error);
        }
    });
}

module.exports = initialize;
