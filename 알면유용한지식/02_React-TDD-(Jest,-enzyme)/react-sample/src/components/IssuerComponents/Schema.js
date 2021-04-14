import React, { Component } from 'react';
// // Multiple Language
import { withTranslation } from "react-i18next"

class Schema extends Component {
  render() {
    return (<>
      <SchemaList />
      <SchemaCreate />
    </>);
  }
}

export default withTranslation()(Schema);