import React, { Component } from 'react';
// // Multiple Language
import { withTranslation } from "react-i18next"

class Credential extends Component {

  render() {
    return (<>
      <CredentialList />
    </>);
  }
}

export default withTranslation()(Definition);