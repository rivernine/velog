import React, { Component } from 'react';
// Multiple Language
import { withTranslation } from "react-i18next"
// Antd
import "antd/dist/antd.css";
import { Input, Button, Modal, message, Switch, Drawer, Form, Col, Row, Select, InputNumber, } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { getSchemas, getSchemasById, postCredentialDefinition } from '../../common/rest.js'

// Drawer
const { Option } = Select;
// Confirm
const { confirm } = Modal;

class SchemaCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      schemaId: undefined,
      tag: undefined,
      revocation: false,
      schemas: [],
      schemaInfo: "Schema ID's information",
      validSchemaId: "error",
      validTag: "error",
      definitionBase: {
        "schema_id": "",
        "tag": "",
        "support_revocation": false
      },
      definitionParameter: {
        "schema_id": "",
        "tag": "",
        "support_revocation": false
      },
      issuanceByDefault: true,
      maxCredentialNumber: undefined,
      validMaxCredentialNumber: "error",
      validMaxCredentialNumberHelp: undefined,
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
  onChangeSchemaId = async function (_schemaId) {
    var _schemaInfo = await getSchemasById(_schemaId)
    var _definitionParameter = this.state.definitionParameter
    _definitionParameter['schema_id'] = _schemaId;
    this.setState({
      validSchemaId: "success",
      schemaId: _schemaId,
      definitionParameter: _definitionParameter,
      schemaInfo: _schemaInfo,
    })
  }.bind(this)

  onChangeTag = function (e) {
    var _definitionParameter = this.state.definitionParameter
    _definitionParameter['tag'] = e;
    this.setState({
      validTag: "success",
      tag: e,
      definitionParameter: _definitionParameter,
    })
  }.bind(this)

  onChangeRevocation = function (e) {
    var _revocation
    if (this.state.revocation) {
      _revocation = false
    } else {
      _revocation = true
    }
    var _definitionParameter = this.state.definitionParameter
    _definitionParameter['support_revocation'] = _revocation;
    this.setState({
      revocation: _revocation,
      definitionParameter: _definitionParameter,
    })
  }.bind(this)

  onChangeDefinitionParameter = function (e) {
    this.setState({
      definitionParameter: this.state.definitionParameter
    })
  }.bind(this)

  onChangeMaxCredentialNumber = function (e) {
    var _validMaxCredentialNumber
    var _validMaxCredentialNumberHelp
    var regexp = /^[0-9]{1,}$/
    
    if (regexp.test(e)) {
      _validMaxCredentialNumber = 'success'
      _validMaxCredentialNumberHelp = undefined
    } else {
      _validMaxCredentialNumber = 'error'
      _validMaxCredentialNumberHelp = 'Please enter interger'
    }
    this.setState({
      maxCredentialNumber: e,
      validMaxCredentialNumber: _validMaxCredentialNumber,
      validMaxCredentialNumberHelp: _validMaxCredentialNumberHelp,
    })
  }.bind(this)

  onChangeIssuanceByDefault = function () {
    var _issuanceByDefault
    if (this.state.issuanceByDefault) {
      _issuanceByDefault = false
    } else {
      _issuanceByDefault = true
    }
    this.setState({
      issuanceByDefault: _issuanceByDefault
    })
  }.bind(this)

  // Confirm
  showConfirm = function () {
    confirm({
      title: 'Do you want to create a new Definition?',
      icon: <ExclamationCircleOutlined />,
      content: 'Press check the revocation properties',
      okButtonProps: { form: "credForm", key: 'submit', htmlType: 'submit' },
      onOk: async function () {
        if (this.state.validSchemaId === 'error') {
          message.error('Please select Schema ID')
          return
        }
        if (this.state.validTag === 'error') {
          message.error('Please select Tag')
          return
        }
        if (this.state.validMaxCredentialNumber === 'error') {
          message.error('Please select Tag')
          return
        }

        // Doing

        if( this.state.revocation ){
          var _credentialDefinition = await postCredentialDefinition(this.state.definitionParameter)

        } else {
          postCredentialDefinition(this.state.definitionParameter)
        }

        this.setState({
          schemaId: undefined,
          tag: undefined,
          revocation: false,
          schemaInfo: "Schema ID's information",
          definitionParameter: this.state.definitionBase,
          validSchemaId: "error",
          validTag: "error",
          validMaxCredentialNumber: "error",
          validMaxCredentialNumberHelp: undefined,
        });
        this.onClose()
        message.success('Complete!')
      }.bind(this),
      onCancel() { },
    });
  }.bind(this);

  // Start
  async componentDidMount() {
    var _schemas = await getSchemas("");
    this.setState({ schemas: _schemas })
  }

  // Start rendering
  render() {
    var schemaOptions = this.state.schemas.map(function (opt) {
      return (<Option key={opt}>{opt}</Option>)
    });
    var _revocationRow = undefined
    if (this.state.revocation) {
      _revocationRow =
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item
              label="Max credential number"
              hasFeedback
              validateStatus={this.state.validMaxCredentialNumber}
              help={this.state.validMaxCredentialNumberHelp}>
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="Please enter number"
                onChange={this.onChangeMaxCredentialNumber}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="Issuance by default">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                defaultChecked
                onClick={this.onChangeIssuanceByDefault}
              />
            </Form.Item>
          </Col>
        </Row>
    }

    return (<>
      <p style={{ float: 'right' }}>
        <Button onClick={this.showDrawer} type="primary" >
          <PlusOutlined /> New definition
          </Button>
      </p>
      <Drawer
        title="Create a new definition"
        width={720}
        onClose={this.onClose}
        visible={this.state.visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={this.onClose} style={{ marginRight: 8 }}>
              Cancel
              </Button>
            <Button onClick={this.showConfirm} type="primary">
              Submit
              </Button>
          </div>
        }
      >
        <Form layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item label="Schema ID" hasFeedback validateStatus={this.state.validSchemaId}>
                <Select
                  placeholder="Please select schema ID"
                  value={this.state.schemaId}
                  onChange={this.onChangeSchemaId}
                >
                  {schemaOptions}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              {/* <Form.Item name="tag" label="Tag" initialValue="default"> */}
              <Form.Item label="Tag" hasFeedback validateStatus={this.state.validTag}>
                <Select
                  placeholder="Please select tag"
                  value={this.state.tag}
                  onChange={this.onChangeTag} >
                  <Option value="default">default</Option>
                  <Option value="test">test</Option>
                  <Option value="membership">membership</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Revocation">
                <Switch onClick={this.onChangeRevocation} checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          {_revocationRow}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Schema Info">
                <Input.TextArea rows={15} value={JSON.stringify(this.state.schemaInfo, null, 4)} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={5}>
            <Col span={24}>
              <Form.Item label="Definition Parameter">
                <Input.TextArea onChange={this.onChangeDefinitionParameter}
                  rows={5} value={JSON.stringify(this.state.definitionParameter, null, 4)} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>);
  }
}

export default withTranslation()(SchemaCreate);