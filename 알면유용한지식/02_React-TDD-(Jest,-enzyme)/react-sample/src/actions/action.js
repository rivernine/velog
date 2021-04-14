export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';

export function signIn(_user) {
  return {
    type: SIGN_IN,
    user: _user,
  };
}

export function signOut() {
  return{
    type: SIGN_OUT,
  }
}

// export const INCREMENT = 'INCREMENT';
// export const DECREMENT = 'DECREMENT';
// export const SET_DIFF = 'SET_DIFF';

// export function increment() {
//   return {
//     type: INCREMENT
//   };
// }

// export function decrement() {
//   return {
//     type: DECREMENT
//   };
// }

// export function setDiff(value) {
//   return {
//     type: SET_DIFF,
//     diff: value
//   };
// }