# React TDD (Jest, enzyme)

## 🎁 목차
- [React TDD (Jest, enzyme)](#react-tdd-jest-enzyme)
  - [🎁 목차](#-목차)
  - [0. 개요](#0-개요)
  - [1. 스냅샷 테스팅](#1-스냅샷-테스팅)
  - [2. 쿼리](#2-쿼리)
  - [3. 컴포넌트 테스트](#3-컴포넌트-테스트)
    - [3.1. FireEvent](#31-fireevent)
    - [3.2. Component](#32-component)
    - [3.3. Component test](#33-component-test)

## 0. 개요
  - Jest: Test Framework
  - enzyyme: Test library

## 1. 스냅샷 테스팅
```js
// 테스트 샘플코드
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

window.matchMedia = window.matchMedia || function() {
  return {
      matches : false,
      addListener : function() {},
      removeListener: function() {}
  };
};

describe('<App/>', () => {
  it('matches snapshot', () => {
    const utils = render(<App/>);
    expect(utils.container).toMatchSnapshot();
  })
  it('shows the props correctly', () => {
    const utils = render(<App/>);
    utils.getByText('ISSUER');
  })
})
```

- describe: 하나의 테스트 그룹
- it: 단위 테스트

- 위 코드를 실행 시 src/__snapshots__ 안에 App.test.js.snap 생성<br>
  컴포넌트가 렌더링됐을 때 스냅샷과 불일치하면 테스트가 실패<br>
  스냅샷 업데이트는 실행 콘솔에서 u키 

```js
// Jest + enzyme
import React from 'react';
import Counter from './counter.jsx';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

describe('<Counter />', () => {
  it('성공적으로 렌더링되어야 합니다.', () => {
    const wrapper = shallow(<Counter />);
    expect(wrapper.length).toBe(1);
  });

  it('타이틀 인풋이 렌더링되어야 합니다.', () => {
    const wrapper = shallow(<Counter />);
    expect(wrapper.find('#title').length).toEqual(1);
  });

  it('타이틀이 변경되어야 합니다.', () => {
    const wrapper = shallow(<Counter />);
    wrapper.find('#title').simulate('change', { target: { value: '값' } });
    expect(wrapper.state().title).toBe('값');
  });

  it('숫자가 올라가야 합니다.', () => {
    const wrapper = shallow(<Counter />);
    wrapper.find('#up').simulate('click');
    wrapper.find('#up').simulate('click');
    expect(wrapper.state().value).toBeLessThan(1);
  });
});
```

## 2. 쿼리
- Variant
  - getBy: 단일선택
  - getAllBy: 복수선택
  - queryBy: geyBy와 같음. 단 존재하지 않아도 에러 안남
  - queryAllBy: getAllBy와 같음. 단 존재하지 않아도 에러 안남
  - findBy: Promise of getBy
  - findAllBy: Promise of getAllBy
- Queries
  - ByLabelText: label 값으로 input 선택
```js
<label for="username-input">아이디</label>
<input id="username-input" />

const inputNode = getByLabelText('아이디');
```
- ByPlaceholderText: placeholder 값으로 input/textarea 선택
```js
<input placeholder="아이디" />;

const inputNode = getByPlaceholderText('아이디');
```
- ByText: text 값으로 DOM선택
```js
<div>Hello World!</div>;

const div = getByText('Hello World!');
```
- ByAltText: alt 속성을 가지고 있는 element 선택(주로 img)
```js
<img src="/awesome.png" alt="awesome image" />;

const imgAwesome = getByAltText('awesomse image');
```
- ByTitle: title 속성을 가지고 있는 DOM
```js
<p>
<span title="React">리액트</span>는 짱 멋진 라이브러리다.
</p>

<svg>
  <title>Delete</title>
  <g><path/></g>
</svg>

const spanReact = getByTitle('React');
const svgDelete = getByTitle('Delete');
```
- ByDisplayValue: input/textarea/select가 지니고 있는 현재 값
```js
<input value="text" />;

const input = getByDisplayValue('text');
```
- ByRole: 특정 role 값을 지니는 element
```js
<span role="button">삭제</span>;

const spanRemove = getByRole('button');
```
- ByTestId: customize
```js
<div data-testid="commondiv">흔한 div</div>;

const commonDiv = getByTestId('commondiv');
```
- 우선순위
```
1. getByLabelText
2. getByPlaceholderText
3. getByText
4. getByDisplayValue
5. getByAltText
6. getByTitle
7. getByRole
8. getByTestId
```
## 3. 컴포넌트 테스트

### 3.1. FireEvent
```js
fireEvent.이벤트이름(DOM, 이벤트객체);

fireEvent.change(myInput, { target: { value: 'hello world' } });
```

### 3.2. Component
```js
// src/Counter.js
import React, { useState, useCallback } from 'react';

const Counter = () => {
  const [number, setNumber] = useState(0);

  const onIncrease = useCallback(() => {
    setNumber(number + 1);
  }, [number]);

  const onDecrease = useCallback(() => {
    setNumber(number - 1);
  }, [number]);

  return (
    <div>
      <h2>{number}</h2>
      <button onClick={onIncrease}>+1</button>
      <button onClick={onDecrease}>-1</button>
    </div>
  );
};
```

### 3.3. Component test
```js
// src/Counter.test.js
import React from 'react';
import { render, fireEvent } from 'react-testing-library';
import Counter from './Counter';

describe('<Counter />', () => {
  it('matches snapshot', () => {
    const utils = render(<Counter />);
    expect(utils.container).toMatchSnapshot();
  });
  it('has a number and two buttons', () => {
    const utils = render(<Counter />);
    // 버튼과 숫자가 있는지 확인
    utils.getByText('0');
    utils.getByText('+1');
    utils.getByText('-1');
  });
  it('increases', () => {
    const utils = render(<Counter />);
    const number = utils.getByText('0');
    const plusButton = utils.getByText('+1');
    // 클릭 이벤트를 두번 발생시키기
    fireEvent.click(plusButton);
    fireEvent.click(plusButton);
    expect(number).toHaveTextContent('2'); // jest-dom 의 확장 matcher 사용
    expect(number.textContent).toBe('2'); // textContent 를 직접 비교
  });
  it('decreases', () => {
    const utils = render(<Counter />);
    const number = utils.getByText('0');
    const plusButton = utils.getByText('-1');
    // 클릭 이벤트를 두번 발생시키기
    fireEvent.click(plusButton);
    fireEvent.click(plusButton);
    expect(number).toHaveTextContent('-2'); // jest-dom 의 확장 matcher 사용
  });
});
```
  