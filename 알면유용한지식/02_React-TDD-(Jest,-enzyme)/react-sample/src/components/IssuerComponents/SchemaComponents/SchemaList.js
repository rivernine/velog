import React, { Component } from 'react';
// Multiple Language
import { withTranslation } from "react-i18next"
import { CopyToClipboard } from "react-copy-to-clipboard"
// Antd
import "antd/dist/antd.css";
import { Table, Tag, Input, Empty, Popconfirm, message, Tooltip, Button } from 'antd';
import { EditOutlined, CopyOutlined, ReloadOutlined, } from '@ant-design/icons';

import { getSchemasById, getSchemasWithSeq, } from '../../common/rest.js'
import SchemaInfo from './SchemaInfo.js'
import SchemaEdit from './SchemaEdit.js'


const { Search } = Input;

class SchemaList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schemas: [
        // {
        //   key: "1",
        //   seq: 1,
        //   schemaId: "schemaId1",
        //   name: "schemaName1",
        //   version: "1.0",
        //   date: '2020-04-01',
        //   tags: ['test'],
        // },
      ],
      schemaList: [],
      seqMap: [],
      searchedData: undefined,
      searchText: '',
      visible: false,
      selectedSchemaId: undefined,
      schemaInfo: undefined,
      loading: false,
      visibleEdit: false,
      selectedSchemaIdEdit: undefined,
      schemaInfoEdit: undefined,
    };
  }

  columns = [
    {
      title: 'Seq',
      dataIndex: 'seq',
      key: 'seq',
      width: 25,
      sorter: (a, b) => a.seq - b.seq,
      ellipsis: false,
    },
    {
      title: 'Schema ID',
      dataIndex: 'schemaId',
      key: 'schemaId',
      width: 140,
      ellipsis: true,
      render: function (_schemaId) {
        return (<a href="#!"
          onClick={async function () {
            var _schemaInfo = await getSchemasById(_schemaId)
            this.setState({
              schemaInfo: _schemaInfo,
              visible: true,
              selectedSchemaId: _schemaId,
            })
          }.bind(this)}>{_schemaId}</a>);
      }.bind(this)
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 50,
      // sorter: (a, b) => a.name - b.name,
      ellipsis: true,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 30,
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 50,
      ellipsis: true,
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
        return (
          <Tooltip title="Reload">
            <Button shape="round" size="small" icon={<ReloadOutlined />}
              loading={this.state.loading}
              onClick={this.onClickReload}
            />
          </Tooltip>
        );
      }.bind(this),
      dataIndex: 'icon',
      key: 'icon',
      width: 30,
      align: "center",
      render: function (_schemaId) {
        return (
          <div>
            <Tooltip placement="bottom" title="Copy schema ID">
              <CopyToClipboard
                text={_schemaId}
                onCopy={function () { message.success({ content: "Schema ID copied to clipboard" }); }}
              ><CopyOutlined /></CopyToClipboard>
            </Tooltip>
          &nbsp;&nbsp;&nbsp;
            <Tooltip placement="bottom" title="Edit schema">
              <Popconfirm
                title="Are you sure edit this schema?"
                onConfirm={async function () {
                  try {
                    var _schemaInfo = await getSchemasById(_schemaId)
                    this.setState({
                      visibleEdit: true,
                      schemaInfoEdit: _schemaInfo,
                    })
                  } catch (e) {
                    message.error({ content: "Failed to get schema" });
                  }
                }.bind(this)}
                // onCancel={popcancel}
                okText="Yes"
                cancelText="No"
                value={_schemaId}
              >
                <EditOutlined />
              </Popconfirm>
            </Tooltip>
          </div>
        );
      }.bind(this)
    },
  ];

  onClickReload = function () {
    this.setState({ loading: true })
    setTimeout(async () => {
      try {
        var _schemas = await getSchemasWithSeq(true)
        this.setState({
          schemas: _schemas,
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
    var _searchedData = []
    for (var i = 0; i < this.state.schemas.length; i++) {
      var _schema = this.state.schemas[i]
      if (_schema.schemaId.indexOf(searchText) >= 0) {
        _searchedData = _searchedData.concat(_schema)
      }
    }
    this.setState({ searchedData: _searchedData })
  }.bind(this)

  onClose = function () {
    this.setState({ visible: false })
  }.bind(this)

  async componentDidMount() {
    console.log("componentDidMount")
    var _schemas = await getSchemasWithSeq(true)
    this.setState({ schemas: _schemas, })
  }

  render() {
    console.log("Render")
    var _desc, _dataSource, _schemaInfo, _schemaEdit

    if (this.state.searchedData === undefined) {
      _dataSource = this.state.schemas;
    } else {
      _dataSource = this.state.searchedData;
    }

    if (this.state.schemas.length > 0) {
      _desc = <Table columns={this.columns} scroll={{ x: 'max-content' }}
        dataSource={_dataSource} />
    } else {
      _desc = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }

    if (this.state.selectedSchemaId !== undefined) {
      _schemaInfo =
        <SchemaInfo
          visible={this.state.visible}
          selectedSchemaId={this.state.selectedSchemaId}
          schemaInfo={this.state.schemaInfo}
          onClose={function () {
            this.setState({ visible: false })
          }.bind(this)} />
    }

    if (this.state.schemaInfoEdit !== undefined) {
      _schemaEdit =
        <SchemaEdit
          visibleEdit={this.state.visibleEdit}
          schemaInfoEdit={this.state.schemaInfoEdit}
          init="true"
          onClose={function () {
            this.setState({ visibleEdit: false })
          }.bind(this)} />
    }

    return (<>
      <Search placeholder="input search text" enterButton
        onChange={this.onChangeSearchText} />
      <br /><br />
      {_desc}
      {_schemaInfo}
      {_schemaEdit}
    </>);
  }
}

export default withTranslation()(SchemaList);