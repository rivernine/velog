import React, { Component } from 'react';
// // Multiple Language
import { withTranslation } from "react-i18next"

import DefinitionCreate from './DefinitionComponents/DefinitionCreate'
import DefinitionList from './DefinitionComponents/DefinitionList'

class Definition extends Component {
  render() {
    return (<>
      <DefinitionList />
      <DefinitionCreate />
    </>);
  }
}

export default withTranslation()(Definition);