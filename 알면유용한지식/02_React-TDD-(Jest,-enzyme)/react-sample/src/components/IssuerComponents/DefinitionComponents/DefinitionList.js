import React, { Component } from 'react';
// Multiple Language
import { withTranslation } from "react-i18next"
// Antd
import "antd/dist/antd.css";
import { Table, Tag, Input, Empty, message, Tooltip, Button, } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import {
  getSchemasById, getSchemasWithSeq,
  getCredentialDefinitionById, getCredentialDefinitions,
} from '../../common/rest.js'
import DefinitionInfo from './DefinitionInfo.js'

// Desc Top
const { Search } = Input;



class DefinitionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      definitions: [],
      searchedDefinition: undefined,
      searchText: '',
      visible: false,
      selectedDefinition: undefined,
      definitionInfo: undefined,
      schemaInfo: undefined,
      loading: false,
    };
  }

  columns = [
    {
      title: 'Seq',
      dataIndex: 'seq',
      key: 'seq',
      width: 20,
      ellipsis: true,
    },
    {
      title: 'Definition ID',
      dataIndex: 'definitionId',
      key: 'definitionId',
      width: 200,
      ellipsis: true,
      render: function (_definition) {
        return (<a href="#!"
          onClick={async function () {
            try {
              var _definitionInfo = await getCredentialDefinitionById(_definition)
              var _seq = parseInt(_definition.split(":")[3])
              var _schemas = await getSchemasWithSeq(false)
              var _schemaInfo
              for (var i = 0; i < _schemas.length; i++) {
                if (_schemas[i]['seq'] === _seq) {
                  _schemaInfo = await getSchemasById(_schemas[i].schemaId)
                  // _schemaInfo = _schemas[i]
                  break
                }
              }
              this.setState({
                visible: true,
                selectedDefinition: _definition,
                definitionInfo: _definitionInfo,
                schemaInfo: _schemaInfo,
              })
            } catch (e) {
              message.error("Failed to get definition Info")
            }
          }.bind(this)}>{_definition}</a>);
      }.bind(this)
    },
    {
      title: 'Remark',
      key: 'remark',
      dataIndex: 'remark',
      width: 40,
      ellipsis: true,
      render: function (tags) {
        return (
          <>
            {tags.map(function (tag) {
              let color = tag.length > 5 ? 'geekblue' : 'green';
              if (tag === 'disabled') {
                color = 'volcano';
              }
              return (
                <Tag color={color} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              );
            })}
          </>);
      }
    },
    {
      title: function () {
        return(
        <Tooltip title="Reload">
          <Button shape="round" size="small" icon={<ReloadOutlined />}
            loading={this.state.loading}
            onClick={this.onClickReload}
          />
        </Tooltip>
        );
      }.bind(this),
      width: 30,
      align: "center",
    },
  ];

  onClickReload = function () {
    this.setState({ loading: true })
    setTimeout(async () => {
      try {
        var _definitions = await getCredentialDefinitions("getCredentialDefinitions")
        this.setState({
          definitions: _definitions,
          loading: false,
        })
      } catch (e) {
        message.error("Failed reload")
      }
    }, 2000)
  }.bind(this)

  // Search
  onChangeSearchText = function (e) {
    var searchText = e.target.value;
    var _searchedDefinition = []
    for (var i = 0; i < this.state.definitions.length; i++) {
      var tmpDefinition = this.state.definitions[i]
      if (tmpDefinition.definitionId.search(searchText) >= 0) {
        _searchedDefinition = _searchedDefinition.concat(tmpDefinition)
      }
    }
    this.setState({ searchedDefinition: _searchedDefinition })
  }.bind(this)

  // Start
  async componentDidMount() {
    var _definitions = await getCredentialDefinitions("getCredentialDefinitions")
    this.setState({ definitions: _definitions })
  }

  // Start rendering
  render() {
    console.log("Render")
    var _desc
    var _dataSource
    var _definitionInfo
    if (this.state.searchedDefinition === undefined) {
      _dataSource = this.state.definitions;
    } else {
      _dataSource = this.state.searchedDefinition;
    }

    if (this.state.definitions.length > 0)
      _desc = <Table columns={this.columns} dataSource={_dataSource} scroll={{ x: 'max-content' }} />
    else
      _desc = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

    if (this.state.selectedDefinition !== undefined) {
      _definitionInfo =
        <DefinitionInfo
          visible={this.state.visible}
          definition={this.state.selectedDefinition}
          definitionInfo={this.state.definitionInfo}
          schemaInfo={this.state.schemaInfo}
          testProps={"test"}
          onClose={function () {
            this.setState({ visible: false })
          }.bind(this)} />
    }

    return (<>
      <Search placeholder="input search text" enterButton
        onChange={this.onChangeSearchText} />
      <br /><br />
      {_desc}
      {_definitionInfo}
    </>);
  }
}

export default withTranslation()(DefinitionList);