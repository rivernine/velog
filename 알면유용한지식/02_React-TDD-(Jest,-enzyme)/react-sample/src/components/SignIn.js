import { Tabs } from 'antd';
import { KeyOutlined, UserAddOutlined, ToolOutlined } from '@ant-design/icons'

import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import { Redirect } from "react-router-dom"

import { connect } from 'react-redux';
import { signIn } from '../actions/action';
import SignInByAccount from './SignInComponents/SignInByAccount'

const { TabPane } = Tabs;

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

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        LG CNS
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function SignIn(props) {
  const classes = useStyles();
  const [email, setEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  console.log(props.authenticated)
  if (props.authenticated) return <Redirect to='/menu' />;
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <Tabs defaultActiveKey="3" size="large" style={{ width: 500}}>
          <TabPane
            tab={<span><KeyOutlined />QR code</span>}
            key="1">
            Tab 1
          </TabPane>
          <TabPane
            tab={<span><UserAddOutlined />New Auth</span>}
            key="2">
            Tab 2
          </TabPane>
          <TabPane
            tab={<span><ToolOutlined />DEV</span>}
            key="3">
            <SignInByAccount props={props}/>
          </TabPane>
        </Tabs>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

let mapStateToProps = (state) => {
  return {
    authenticated: state.sign.authenticated
  }
}

let mapDispatchToProps = (dispatch) => {
  return {
    onSignIn: (_user) => dispatch(signIn(_user))
  }
}

SignIn = connect(mapStateToProps, mapDispatchToProps)(SignIn);

export default SignIn;