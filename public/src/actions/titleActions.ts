import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  SetTitle: 'SET_TITLE',
  ResetTitle: 'RESET_TITLE'
});

export const setTitle = (title: string): FluxStandardAction => ({
  type: ActionTypes.SetTitle,
  payload: { title }
});

export const resetTitle = (): FluxStandardAction => ({
  type: ActionTypes.ResetTitle
});
