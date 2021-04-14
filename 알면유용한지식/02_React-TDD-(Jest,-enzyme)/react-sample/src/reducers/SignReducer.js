// import { INCREMENT, DECREMENT, SET_DIFF } from '../actions';
import { SIGN_IN, SIGN_OUT } from '../actions/action';

// import { persistReducer } from 'redux-persist';
// import storageSession from 'redux-persist/lib/storage/session'

// const persistConfig = {
//   key: 'root',
//   storage: storageSession,
//   whitelist: ["sign"]
// }

const signInitialState = {
  authenticated: false,
  userEmail: null,
  userPassword: null,
  user: { email: null, password: null }
};

const sign = (state = signInitialState, action) => {
  switch (action.type) {
    case SIGN_IN:
      return Object.assign({}, state, {
        user: action.user,
        authenticated: true
      });
    case SIGN_OUT:
      return Object.assign({}, state, {
        user: { "email": null, "password": null },
        authenticated: false
      })
    default:
      return state;
  }
};

// const adminApp = combineReducers({
//   sign,
// });

export default sign;
// export default persistReducer(persistConfig, adminApp)

// const counterInitialState = {
//   value: 0,
//   diff: 1
// };

// const counter = (state = counterInitialState, action) => {
//   switch (action.type) {
//     case INCREMENT:
//       return Object.assign({}, state, {
//         value: state.value + state.diff
//       });
//     case DECREMENT:
//       return Object.assign({}, state, {
//         value: state.value - state.diff
//       });
//     case SET_DIFF:
//       return Object.assign({}, state, {
//         diff: action.diff
//       });
//     default:
//       return state;
//   }
// };

// const extra = (state = { value: 'this_is_extra_reducer' }, action) => {
//   switch (action.type) {
//     default:
//       return state;
//   }
// }

// const counterApp = combineReducers({
//   counter,
//   extra
// });


// export default counterApp;

