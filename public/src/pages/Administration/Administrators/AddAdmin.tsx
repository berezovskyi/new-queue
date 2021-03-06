import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../../store';
import { addAdministrator } from '../../../actions/administratorActions';
import User from '../../../models/User';
import AddInputViewComponent from '../../../viewcomponents/AddInput';

export default (): JSX.Element | null => {

  const user = useSelector<GlobalStore, User | null>(store => store.user);

  const dispatch = useDispatch();

  return (
    user === null || !user.isAdministrator
      ? null
      : <>
          <p>Insert the new administrator's username</p>
          <div className="col-12 col-lg-8 p-0">
            <AddInputViewComponent
              callback={(newAdministrator: string) => dispatch(addAdministrator(newAdministrator))}
              placeholder="Add admin" />
          </div>
          <br />
        </>

  );
};
