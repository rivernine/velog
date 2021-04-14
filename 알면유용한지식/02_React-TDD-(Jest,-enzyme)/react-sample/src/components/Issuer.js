import React, { Component } from 'react';
// Multiple Language
import { withTranslation } from "react-i18next"
// Antd
import "antd/dist/antd.css";
import { Menu } from 'antd';
import {
  OrderedListOutlined,
  PartitionOutlined,
  FileProtectOutlined,
  SettingOutlined,
  BankOutlined,
} from '@ant-design/icons';

import Schema from "./IssuerComponents/Schema";
import Definition from "./IssuerComponents/Definition";
import Info from "./IssuerComponents/Info";

const { SubMenu } = Menu;

class Issuer extends Component {
  render() {
    const { t } = this.props;
    return (
      <Menu theme="dark" defaultSelectedKeys={["info"]} mode="inline">
        <Menu.Item key="info"
          icon={<BankOutlined />}
          onClick={function () {
            this.props.onChangePath("/Info");
            this.props.onChangeDescription(<Info />);
          }.bind(this)}>
          {t("Info")}
        </Menu.Item>
        <SubMenu key="credential"
          icon={<FileProtectOutlined />}
          title={t("Credential")}>
          <Menu.Item key="credList">
            {t("CredentialList")}
          </Menu.Item>
        </SubMenu>
        <Menu.Item key="schema"
          icon={<PartitionOutlined />}
          onClick={function () {
            this.props.onChangePath("/Schema");
            this.props.onChangeDescription(<Schema />);
          }.bind(this)}>
          {t("Schema")}
        </Menu.Item>
        <Menu.Item key="definition"
          icon={<OrderedListOutlined />}
          onClick={function () {
            this.props.onChangePath("/Definition");
            this.props.onChangeDescription(<Definition />);
          }.bind(this)}>
          {t("Definition")}
        </Menu.Item>
        <SubMenu key="configuration"
          icon={<SettingOutlined />}
          title={t("Configuration")}>
          <Menu.Item key="confTran"
            onClick={function () {
              this.props.onChangeLanguage();
            }.bind(this)}>{t("translation")}</Menu.Item>
          <Menu.Item key="confIV"
            onClick={function () {
              this.props.onChangeMode();
            }.bind(this)}>VERIFIER</Menu.Item>
        </SubMenu>
      </Menu >
    );
  }
}

export default withTranslation()(Issuer);