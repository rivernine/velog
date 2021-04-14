// import React, { Component } from 'react';
// Multiple Language
// Antd
import "antd/dist/antd.css";
import { message, } from 'antd';

import { properties } from '../../config/properties.js'

// Rest
const getSchemas = async function (isShow) {
  var result = []
  console.log("getSchemasList")
  const key = "getSchemasList"
  try {
    if (isShow)
      message.loading({ content: "Getting schema list...", key });
    const response = await fetch(properties.getSchemasUrl)
    var _schemaIds = (await response.json()).schema_ids
    var st = new Set();
    for (var i = 0; i < _schemaIds.length; i++) {
      if (!st.has(_schemaIds[i])) {
        st.add(_schemaIds[i])
        result.push(_schemaIds[i])
      }
    }
    if (isShow)
      message.success({ content: "Completed to get schema list ", key });
  } catch (e) {
    if (isShow)
      message.error({ content: "Failed to get schema list", key });
  }
  return result
}

const getSchemasById = async function (_schemaId) {
  console.log("getSchemasById")
  var result
  try {
    const response = await fetch(properties.getSchemasByIdUrl + _schemaId)
    result = response.json()
  } catch (e) {
    message.error({ content: "Failed to get schema" });
  }
  return result
}

const getSchemasWithSeq = async function (isShow) {
  console.log("getSchemasWithSeq")
  var result = []
  try {
    var _schemas = await getSchemas(isShow)
    // console.log(_schemas)
    for (var i = 0; i < _schemas.length; i++) {
      var _schemaInfo = await getSchemasById(_schemas[i])
      var _schemaId = _schemaInfo.schema.id
      var _schemaIdSplit = _schemaId.split(':')
      result.push({
        key: (result.length + 1).toString(),
        seq: _schemaInfo.schema.seqNo,
        schemaId: _schemaId,
        name: _schemaIdSplit[2],
        version: _schemaIdSplit[3],
        date: '2020-04-01',
        remark: ['test'],
        icon: _schemaId,
      })
    }
  } catch (e) {
    message.error({ content: "Failed" });
  }
  return result
}

const postSchemas = async function (_schemaParameter) {
  console.log("postSchemas")
  try {
    var response = await fetch(properties.postRegisterNewSchemaWithDuplicationCheckUrl, {
      method: "POST",
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(_schemaParameter)
    })
    return response
  } catch (e) {
    message.error("Failed to create schema");
  }
}

const getCredentialDefinitions = async function () {
  console.log("getCredentialDefinitions")
  var result = []
  const key = 'getCredentialDefinitionsKey'
  message.loading({ content: "Getting definition list...", key });
  try {
    var response = await fetch(properties.getCredentialDefinitionsUrl)
    var _credentialDefinitions = (await response.json()).credential_definition_ids
    for (var i = 0; i < _credentialDefinitions.length; i++) {
      result.push(
        {
          key: (result.length + 1).toString(),
          seq: result.length + 1,
          definitionId: _credentialDefinitions[i],
          remark: ['test'],
        }
      )
    }
    message.success({ content: "Completed to get definition list !!", key });
  } catch (e) {
    message.error({ content: "Failed to get definition list", key });
  }
  return result
}

const getCredentialDefinitionById = async function (_definition) {
  console.log("getCredentialDefinitionById")
  var result
  try {
    const response = await fetch(properties.getCredentialDefinitionByIdUrl + _definition)
    result = response.json()
  } catch (e) {
    message.error({ content: "Failed to get credential definition" });
  }
  return result
}

const postCredentialDefinition = async function (_definitionParameter) {
  console.log("postCredentialDefinition")
  var result
  try {
    // const response = await fetch(properties.postCredentialDefinitionUrl, {
    //   method: "POST",
    //   headers: { 'content-type': 'application/json' },
    //   body: JSON.stringify(_definitionParameter)
    // })
    // result = await (response.json()).credential_definition_id
  } catch (e) {
    message.error("Failed to create definition");
  }
  return result
}

export {
  getSchemas, getSchemasById, getSchemasWithSeq, postSchemas,
  getCredentialDefinitionById, getCredentialDefinitions, postCredentialDefinition,
};