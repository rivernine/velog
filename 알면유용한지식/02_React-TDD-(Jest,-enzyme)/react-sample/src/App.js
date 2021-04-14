import React, { Component } from 'react'
import './App.css';
import { properties } from './config/properties.js'
// Socket
// import SockJsClient from 'react-stomp'
// Multiple Language
import { withTranslation } from "react-i18next"
import i18next from "./config/lang/i18n.js"
// Ant Design
import "antd/dist/antd.css"
import { Layout, Breadcrumb, } from 'antd'
import {
} from '@ant-design/icons'
// Redux
// import { connect } from 'react-redux';
// Component
import Issuer from "./components/Issuer"
import Verifier from "./components/Verifier"
import Info from "./components/IssuerComponents/Info"
import InfoBar from './components/InfoBar'

const { Header, Content, Footer, Sider } = Layout;
// const sockSuccess = function(){
//   message.success('Connection success')
// }

// const sockError = function(){
//   message.error('Disconnect')
// }

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: properties.mode,
      collapsed: false,
      language: 'en',
      path: '/',
      desc: <Info/>,
    }
  }

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  render() {
    var _menu = null;
    if (this.state.mode === 'ISSUER') {
      _menu =
        <Issuer
          onChangePath={function(_path) {
            this.setState({ path: _path });
          }.bind(this)}
          onChangeDescription={function(_desc){
            this.setState({ desc: _desc});
          }.bind(this)}
          onChangeLanguage={function () {
            if (this.state.language === 'en') {
              i18next.changeLanguage('ko')
              this.setState({ language: 'ko' })
            } else {
              i18next.changeLanguage('en')
              this.setState({ language: 'en' })
            }
          }.bind(this)}
          onChangeMode={function () {
            this.setState({ mode: 'VERIFIER', });
          }.bind(this)} />

    } else if (this.state.mode === 'VERIFIER') {
      _menu =
        <Verifier
          onChangeLanguage={function () {
            if (this.state.language === 'en') {
              i18next.changeLanguage('ko')
              this.setState({ language: 'ko' })
            } else {
              i18next.changeLanguage('en')
              this.setState({ language: 'en' })
            }
          }.bind(this)}
          onChangeMode={function () {
            this.setState({ mode: 'ISSUER', });
          }.bind(this)}
        />
    }

    console.log(this.props.authenticated)

    return (
      <>
      {/* <SockJsClient
          url='http://10.81.160.93:7080/ws'
          topics={['/topic/public']}
          onMessage={function(msg){
            console.log("[Recieve]");
            console.log(msg.sender + ": " + msg.content);
          }}
          onConnect={sockSuccess}
          onDisconnect={sockError}
          ref={function(client){
            this.clientRef = client;
          }.bind(this)}
         /> */}
         
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
          <div className="logo">
            <div className="title">{this.state.mode}</div>
          </div>
          {_menu}
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }} >
            <InfoBar/>
          </Header>
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>{this.state.path}</Breadcrumb.Item>
            </Breadcrumb>
            {this.state.desc}
          </Content>
          <Footer style={{ textAlign: 'center' }}>LG CNS ©2020</Footer>
        </Layout>
      </Layout>
      </>
    );
  }
}

// let mapStateToProps = (state) => {
//   return {
//     user: state.sign.user,
//     authenticated: state.sign.authenticated
//     // email: state.signIn.userEmail
//   };
// }

// App = connect(mapStateToProps)(App);

export default withTranslation()(App);
// export default App;
