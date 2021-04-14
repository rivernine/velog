import React, { Component } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import SignIn from './components/SignIn'
import AuthRoute from './AuthRoute'

import { connect } from 'react-redux'

class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  render() {
    return (<>
      <Router>
        <Route exact path="/" component={SignIn}/>
        <Route path="/login" component={SignIn}/>
        {/* <Route path="/menu" component={App}/> */}
        <AuthRoute
          authenticated={this.props.authenticated}
          path='/menu'
          render={props => <App user={this.props.user} {...props}/> }
        />
      </Router>
    </>);
  }
}

let mapStateToProps = (state) => {
  return {
    user: state.sign.user,
    authenticated: state.sign.authenticated
  };
}

Routes = connect(mapStateToProps)(Routes);

export default Routes;