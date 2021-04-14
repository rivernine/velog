import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';


import { Redirect } from "react-router-dom"

import { connect } from 'react-redux';
import { signIn } from '../../actions/action';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

function SignInByAccount(props) {
  const classes = useStyles();
  const [email, setEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  if (props.authenticated) return <Redirect to='/menu' />;
  return (
    <form className={classes.form} noValidate
      onSubmit={function (e) {
        e.preventDefault()
        // props.history.push('/menu')
        if (email === "test" && password === "test") {
          props.onSignIn({ "email": email, "password": password })
        } else {
          setEmail(undefined)
          setPassword(undefined)
        }
      }}>

      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email || ''}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password || ''}
        onChange={(e) => setPassword(e.target.value)}
      />
      <FormControlLabel
        control={<Checkbox value="remember" color="primary" />}
        label="Remember me"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        Sign In
          </Button>
      {/* <Grid container>
        <Grid item xs>
          <Link href="/menu" variant="body2">
            Forgot password?
              </Link>
        </Grid>
        <Grid item>
          <Link href="#" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Grid>
      </Grid> */}
    </form>
  );
}

let mapStateToProps = (state) => {
  return {
    authenticated: state.sign.authenticated
  }
}

let mapDispatchToProps = (dispatch) => {
  return {
    onSignIn: (_user) => dispatch(signIn(_user)),
  }
}

SignInByAccount = connect(mapStateToProps, mapDispatchToProps)(SignInByAccount);

export default SignInByAccount;