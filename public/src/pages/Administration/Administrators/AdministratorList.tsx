import React from 'react';
import Administrator from '../../../models/Administrator';

export default function AdministrationListViewComponent(props: any) {

  let administrators: Administrator[] = props.administrators;

  function removeAdministrator(administrator: Administrator): void | undefined {
    alert('Not yet implemented');
  }

  return (
    administrators.length
      ? <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {
                administrators.map((administrator: Administrator) =>
                  <tr key={administrator.username}>
                    <td>{ administrator.realname }</td>
                    <td>
                      {
                        administrators.length <= 1
                          ? administrator.username
                          : <>
                              {administrator.username} <span className="text-danger clickable" title="Remove admin" onClick={() => removeAdministrator(administrator)}>
                                <i className="fas fa-times"></i>
                              </span>
                            </>
                      }
                    </td>
                  </tr>)
              }
            </tbody>
          </table>
        </div>
      : <div>
          (No admins, you are totally screwed now ... ;) )
        </div>
  );
}
