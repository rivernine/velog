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

function SignInByQr(props) {

}

// let mapStateToProps = (state) => {
//   return {
//     authenticated: state.sign.authenticated
//   }
// }

// let mapDispatchToProps = (dispatch) => {
//   return {
//     onSignIn: (_user) => dispatch(signIn(_user)),
//   }
// }

// SignInByAccount = connect(mapStateToProps, mapDispatchToProps)(SignInByAccount);

export default SignInByQr;