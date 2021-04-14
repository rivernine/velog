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

class DefinitionInfo extends React.Component {
  state = { visible: false, };

  render() {
    var _definitionInfo
    var _revocationAvailability = "UNABLE"
    if (this.props.definitionInfo.credential_definition.value.revocation !== undefined) {
      _revocationAvailability = "ABLE"
    }
    if (this.props.schemaInfo !== undefined && this.props.visible) {
      _definitionInfo =
        <Drawer
          width={640}
          placement="right"
          closable={false}
          onClose={this.props.onClose}
          visible={this.props.visible}
        >
          <p className="site-description-item-profile-p" style={{ marginBottom: 24 }}>
            Definition Information
          </p>
          <p className="site-description-item-profile-p">Summary</p>
          <Row>
            <Col span={24}>
              <DescriptionItem title="Definition ID" content={this.props.definition} />
            </Col>
          </Row>
          <Row>
            <Col span={14}>
              <DescriptionItem title="Agent Public DID" content={this.props.definition.split(":")[0]} />
            </Col>
            <Col span={10}>
              <DescriptionItem title="Type" content={this.props.definition.split(":")[1]} />
            </Col>
          </Row>
          <Row>
            <Col span={14}>
              <DescriptionItem title="Tag" content={this.props.definitionInfo.credential_definition.tag} />
            </Col>
            <Col span={10}>
              <DescriptionItem title="Cipher Type" content={this.props.definition.split(":")[2]} />
            </Col>
          </Row>
          <Row>
            <Col span={14}>
              <DescriptionItem title="Standard Version" content={this.props.definitionInfo.credential_definition.ver} />
            </Col>
            <Col span={10}>
              <DescriptionItem title="Revocation Availability" content={_revocationAvailability} />
            </Col>
          </Row>
          <Row>
            <Col span={14}>
              <DescriptionItem title="Schema Sequence Number" content={this.props.definition.split(":")[3]} />
            </Col>
          </Row>
          <Divider />
          <p className="site-description-item-profile-p">Schema Info</p>
          <Row>
            <Col span={14}>
              <DescriptionItem title="Schema ID" content={this.props.schemaInfo.schema.id} />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Input.TextArea rows={15} value={JSON.stringify(this.props.schemaInfo.schema, null, 4)} disabled />
            </Col>
          </Row>
          <Divider />
        </Drawer>
    }
    return (<>
      {_definitionInfo}
    </>);
  }
}

export default withTranslation()(DefinitionInfo);