import React from 'react';
import { Redirect } from "react-router-dom";
import SocketConnection from '../../../utils/SocketConnection';
import RequestMessage from '../../../utils/RequestMessage';
import User from '../../../models/User';
import AddInputViewComponent from '../../../viewcomponents/AddInput';

export default function AddAdministratorViewComponent(props: any) {

  let user: User = props.user;
  let socket: SocketConnection = props.socket;

  function addAdmin(newAdmin: string): void {
    alert('Not yet implemented');
  }

  return (
    user === null || !user.isAdministrator
      ? null
      : <>
          <p>Insert the new administrator's username</p>
          <div className="col-12 col-lg-8 p-0">
            <AddInputViewComponent
              callback={addAdmin}
              placeholder={'Add admin'} />
          </div>
          <br />
        </>

  );
}
