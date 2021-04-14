import React, { Component } from 'react';
// Multiple Language
import { withTranslation } from "react-i18next"
// import i18next from "../config/lang/i18n.js"
// Antd
import "antd/dist/antd.css";
import { Menu } from 'antd';
import {
  DesktopOutlined,
  FileProtectOutlined,
  SettingOutlined,
} from '@ant-design/icons';


const { SubMenu } = Menu;


class Verifier extends Component {
  render() {
    const { t } = this.props;
    return (
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <SubMenu key="credential" icon={<FileProtectOutlined />} title={t("Credential")}>
          <Menu.Item key="credList">{t("list")}</Menu.Item>
        </SubMenu>
        <SubMenu key="connection" icon={<DesktopOutlined />} title={t("Connection")}>
          <Menu.Item key="connStat">{t("status")}</Menu.Item>
          <Menu.Item key="connReco">{t("reconnection")}</Menu.Item>
        </SubMenu>
        <SubMenu key="configuration" icon={<SettingOutlined />} title={t("Configuration")}>
          <Menu.Item key="confTran" onClick={function () {
            this.props.onChangeLanguage();
          }.bind(this)}>{t("translation")}</Menu.Item>
          <Menu.Item key="confIV" onClick={function () {
            this.props.onChangeMode();
          }.bind(this)}>ISSUER</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

export default withTranslation()(Verifier);
// export default Verifier;