import React, { Component } from 'react';
// // Multiple Language
import { withTranslation } from "react-i18next"
// Antd
import "antd/dist/antd.css";
import { Input, Button, Modal, message, Drawer, Form, Col, Row, Select, } from 'antd';
import { ExclamationCircleOutlined, } from '@ant-design/icons';

import { postSchemas } from '../../common/rest.js'

// Drawer
const { Option } = Select;
// Confirm
const { confirm } = Modal;

class SchemaEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      validSchemaVersion: "error",
      validSchemaAttributes: "success",
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

  onClose = function () {
    this.setState({ visible: false });
  }.bind(this);

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
      onOk: function () {
        var isValid = true
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
        postSchemas(this.state.schemaParameter)
        this.onClose()
        this.setState({
          validSchemaVersion: "error",
          validSchemaAttributes: "error",
          validSchemaVersionHelp: undefined,
          schemaVersion: "",
          schemaParameter: this.state.schemaParameterBase
        })
        message.success('Complete!')
      }.bind(this),
      onCancel() { },
    });
  }.bind(this);

  componentDidMount() {
    console.log("componentDidMount")
    var _schemaParameter = {
      "schema_version": this.state.schemaVersion,
      "schema_name": this.props.schemaInfoEdit.schema.name,
      "attributes": this.props.schemaInfoEdit.schema.attrNames,
    };
    this.setState({
      schemaAttributes: this.props.schemaInfoEdit.schema.attrNames,
      schemaName: this.props.schemaInfoEdit.schema.name,
      schemaParameter: _schemaParameter,
    })
  }

  render() {
    return (<>
      <Drawer
        title="Edit a schema"
        width={720}
        onClose={this.props.onClose}
        visible={this.props.visibleEdit}
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
              <Form.Item label="Schema Name" hasFeedback validateStatus="success">
                <Input
                  disabled
                  type="text"
                  value={this.props.schemaInfoEdit.schema.name}
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
                  defaultValue={this.props.schemaInfoEdit.schema.attrNames}
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
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>);
  }
}

export default withTranslation()(SchemaEdit);