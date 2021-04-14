import React from 'react';
import { shallow, configure } from 'enzyme';
import { render } from '@testing-library/react';
import Adapter from 'enzyme-adapter-react-16';

import App from './App';
import {SchemaCreate} from './component/IssuerComponent/SchemaComponent/SchemaCreate'

configure({ adapter: new Adapter() });

describe('Schema Create Component', () => {
  describe('test', () =>{
    it('test it', () => {
      const schemaCreate = shallow(<SchemaCreate/>)
      const expected = {
        visible: false,
      }
      expected(schemaCreate.state()).toEqual(expected)
    })
  })
})



// window.matchMedia = window.matchMedia || function() {
//   return {
//       matches : false,
//       addListener : function() {},
//       removeListener: function() {}
//   };
// };



// describe('<App123/>', () => {
//   it('matches snapshot', () => {
//     const utils = render(<App/>);
//     expect(utils.container).toMatchSnapshot();
//   })
//   it('shows the props correctly', () => {
//     const utils = render(<App/>);
//     utils.getByText('ISSUER');
//   })
// })