import React from 'react';
// // Multiple Language
import { withTranslation } from "react-i18next"
// Antd
import "antd/dist/antd.css";
import { Drawer, Divider, Col, Row, Input, } from 'antd';

const DescriptionItem = ({ title, content }) => (
  <div className="site-description-item-profile-wrapper">
    <p className="site-description-item-profile-p-label">{title}:</p>
    {content}
  </div>
);

class SchemaInfo extends React.Component {
  state = { visible: false, };

  render() {
    var _schemaInfo
    if (this.props.schemaInfo !== undefined && this.props.visible) {
      _schemaInfo =
        <Drawer
          width={640}
          placement="right"
          closable={false}
          onClose={this.props.onClose}
          visible={this.props.visible}
        >
          <p className="site-description-item-profile-p" style={{ marginBottom: 24 }}>
            Schema Information
          </p>
          <p className="site-description-item-profile-p">Summary</p>
          <Row>
            <Col span={24}>
              <DescriptionItem title="Schema ID" content={this.props.schemaInfo.schema.id} />
            </Col>
          </Row>
          <Row>
            <Col span={14}>
              <DescriptionItem title="Agent Public DID" content={this.props.schemaInfo.schema.id.split(":")[0]} />
            </Col>
            <Col span={10}>
              <DescriptionItem title="Type" content={this.props.schemaInfo.schema.id.split(":")[1]} />
            </Col>
          </Row>
          <Row>
            <Col span={14}>
              <DescriptionItem title="Name" content={this.props.schemaInfo.schema.name} />
            </Col>
            <Col span={10}>
              <DescriptionItem title="Version" content={this.props.schemaInfo.schema.version} />
            </Col>
          </Row>
          <Row>
            <Col span={14}>
              <DescriptionItem title="Standard Version" content={this.props.schemaInfo.schema.ver} />
            </Col>
            <Col span={10}>
              <DescriptionItem title="Sequence Number" content={this.props.schemaInfo.schema.seqNo} />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <DescriptionItem title="Attribute Name" content={JSON.stringify(this.props.schemaInfo.schema.attrNames)} />
            </Col>
          </Row>
          <Divider />
          <p className="site-description-item-profile-p">Raw</p>
          <Row>
            <Col span={24}>
              <Input.TextArea rows={15} value={JSON.stringify(this.props.schemaInfo.schema, null, 4)} disabled />
            </Col>
          </Row>
          <Divider />
        </Drawer>
    }
    return (<>
      {_schemaInfo}
    </>);
  }
}

export default withTranslation()(SchemaInfo);