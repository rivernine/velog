import React, { Component } from 'react';
// // Multiple Language
import { withTranslation } from "react-i18next"
// Antd
import "antd/dist/antd.css";
import { Input, Button, Modal, message, Drawer, Form, Col, Row, Select } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, } from '@ant-design/icons';

import { postSchemas } from '../../common/rest.js'

const { Option } = Select;
const { confirm } = Modal;

class SchemaCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      validSchemaName: "error",
      validSchemaVersion: "error",
      validSchemaAttributes: "error",
      validSchemaVersionHelp: undefined,
      schemaName: "",
      schemaVersion: "",
      schemaRemark: "none",
      schemaParameter: {
        "schema_version": "",
        "schema_name": "",
        "attributes": []
      },
      schemaParameterBase: {
        "schema_version": "",
        "schema_name": "",
        "attributes": []
      },
      schemaAttributes: [],
    };
  }

  // Drawer
  showDrawer = function () {
    this.setState({ visible: true });
  }.bind(this);

  onClose = function () {
    this.setState({ visible: false });
  }.bind(this);

  // onChange
  onChangeSchemaName = function (e) {
    var _schemaAttribute = this.state.schemaParameter["attributes"]
    var _schemaName = e.target.value
    var _schemaParameter = {
      "schema_version": this.state.schemaVersion,
      "schema_name": _schemaName,
      "attributes": _schemaAttribute
    };
    var isValid = "success"
    if (_schemaName === '')
      isValid = "error"

    this.setState({
      validSchemaName: isValid,
      schemaName: _schemaName,
      schemaParameter: _schemaParameter
    });
  }.bind(this)

  onChangeSchemaVersion = function (e) {
    var _schemaAttribute = this.state.schemaParameter["attributes"]
    var _schemaVersion = e.target.value
    var _schemaParameter = {
      "schema_version": _schemaVersion,
      "schema_name": this.state.schemaName,
      "attributes": _schemaAttribute
    };

    var regexp1 = /^[0-9]{1,}[.][0-9]{1,}$/
    var regexp2 = /^[0-9]{1,}[.][0-9]{1,}[.][0-9]{1,}$/
    var isValidSchemaVersion = "success"
    var isValidSchemaVersionHelp = undefined
    if (_schemaVersion === '') {
      isValidSchemaVersion = "error"
    } else if (!(regexp1.test(_schemaVersion) || regexp2.test(_schemaVersion))) {
      isValidSchemaVersionHelp = "Must be x.x or x.x.x"
      isValidSchemaVersion = "error"
    }
    this.setState({
      validSchemaVersion: isValidSchemaVersion,
      validSchemaVersionHelp: isValidSchemaVersionHelp,
      schemaVersion: _schemaVersion,
      schemaParameter: _schemaParameter
    });
  }.bind(this)

  onChangeSchemaRemark = function (value) {
    this.setState({ schemaRemark: value });
  }.bind(this)

  onChangeSchemaAttributes = function (selectedItems) {
    var isValidSchemaAttributes = "success"
    if (selectedItems.length <= 0) {
      isValidSchemaAttributes = "error"
    }
    var _schemaParameter = {
      "schema_version": this.state.schemaVersion,
      "schema_name": this.state.schemaName,
      "attributes": selectedItems
    };
    this.setState({
      schemaAttributes: selectedItems,
      schemaParameter: _schemaParameter,
      validSchemaAttributes: isValidSchemaAttributes,
    })
  }.bind(this)

  showConfirm = function () {
    confirm({
      title: 'Do you want to create a new Schema?',
      icon: <ExclamationCircleOutlined />,
      // content: 'Press OK to create a new Schema',
      okButtonProps: { form: "scheForm", key: 'submit', htmlType: 'submit' },
      onOk: async function () {
        var isValid = true
        if (this.state.validSchemaName === 'error') {
          message.error('Please check Schema name')
          isValid = false
        }
        if (this.state.validSchemaVersion === 'error') {
          message.error('Please check Schema version');
          isValid = false
        }
        if (this.state.validSchemaAttributes === 'error') {
          message.error('Please check Schema attributes');
          isValid = false
        }
        if (!isValid) {
          return
        }
        try {
          await postSchemas(this.state.schemaParameter)
          this.onClose()
          this.setState({
            validSchemaName: "error",
            validSchemaVersion: "error",
            validSchemaAttributes: "error",
            validSchemaVersionHelp: undefined,
            schemaVersion: "",
            schemaName: "",
            schemaParameter: this.state.schemaParameterBase,
            schemaAttributes: []
          })
          // message.success('Complete!')
        } catch (e) {
          // message.error('Failed to create schema')
        }

      }.bind(this),
      onCancel() { },
    });
  }.bind(this);

  render() {

    return (<>
      <p style={{ float: 'right' }}>
        <Button onClick={this.showDrawer} type="primary" >
          <PlusOutlined /> New schema
        </Button>
      </p>
      <Drawer
        title="Create a new schema"
        width={720}
        onClose={this.onClose}
        visible={this.state.visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right', }}>
            <Button onClick={this.onClose} style={{ marginRight: 8 }}>
              Cancel
             </Button>
            <Button onClick={this.showConfirm} type="primary" >
              Submit
            </Button>
          </div>
        }>
        <Form id="scheForm" layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Schema Name" hasFeedback validateStatus={this.state.validSchemaName}>
                <Input
                  type="text"
                  placeholder="Please enter schema name"
                  value={this.state.schemaName}
                  onChange={this.onChangeSchemaName}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Version"
                hasFeedback
                validateStatus={this.state.validSchemaVersion}
                help={this.state.validSchemaVersionHelp}
              >
                <Input
                  type="text"
                  value={this.state.schemaVersion}
                  placeholder="Please enter version"
                  onChange={this.onChangeSchemaVersion} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="remark" label="Remark" initialValue="none">
                <Select disabled onSelect={function (value) {
                  this.onChangeSchemaRemark(value);
                }.bind(this)}>
                  <Option value="none">None</Option>
                  <Option value="dev">Dev</Option>
                  <Option value="prod">Prod</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="Attributes"
                hasFeedback
                validateStatus={this.state.validSchemaAttributes}
              >
                <Select
                  mode="tags" style={{ width: '100%' }}
                  onChange={this.onChangeSchemaAttributes}
                  tokenSeparators={[',']}
                  notFoundContent={null}
                  placeholder="Please enter attribute"
                  value={this.state.schemaAttributes}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Schema Parameter">
                <Input.TextArea
                  disabled
                  rows={15}
                  value={JSON.stringify(this.state.schemaParameter, null, 4)}
                />
                {/* onChange={this.onChangeSchemaParameter} */}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>);
  }
}

export default withTranslation()(SchemaCreate);