import React from 'react';
import Queue from '../../models/Queue';
import User from '../../models/User';
import { Invisible, Lock, Users } from '../../viewcomponents/FontAwesome';

export default (props: any): JSX.Element => {

  const queue: Queue = props.queue;
  const user: User = props.user;

  const styles = { color: 'inherit', fontSize: '1.3em' };

  if (queue.hiding) {
    styles.color = 'gray';
  }
  else if (queue.locked) {
    styles.color = 'red';
  }

  return (
    <div className="card row clickable p-lg-2" style={styles}>
      <div className="card-body">
        <div className="float-left">
          {queue.hiding ? <span style={{marginRight: '1em'}}><Invisible /></span> : null}
          {queue.locked ? <span style={{marginRight: '1em'}}><Lock /></span> : null}
          {queue.name}
        </div>
        {
          queue.queueEntries
            ? <div className="float-right">
                {
                  user !== null && queue.queueEntries.some(entry => entry.ugkthid === user.ugkthid)
                    ? <>
                        {`${queue.queueEntries.findIndex(entry => entry.ugkthid === user.ugkthid) + 1}/${queue.queueEntries.length}`} <Users />
                      </>
                    : <>
                        {queue.queueEntries.length} <Users />
                      </>
                }
              </div>
            : null
        }
      </div>
    </div>
  );
};
