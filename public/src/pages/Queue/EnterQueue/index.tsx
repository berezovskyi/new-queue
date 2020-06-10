import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import debounce from 'lodash.debounce';
import { GlobalStore } from '../../../store';
import { joinQueue, leaveQueue, recievingHelp, updatePersonalEntry } from '../../../actions/queueActions';
import User from '../../../models/User';
import QueueEntry from '../../../models/QueueEntry';
import { Lock } from '../../../viewcomponents/FontAwesome';

export default (props: any): JSX.Element | null => {

  const queueName: string = props.queueName;

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const personalQueueEntry = useSelector<GlobalStore, QueueEntry | null>(store => store.queues.queueList.filter(q => q.name === queueName)[0].queueEntries.filter(e => e.ugkthid === user?.ugkthid)[0] || null);
  const isLocked = useSelector<GlobalStore, boolean>(store => store.queues.queueList.filter(queue => queue.name === queueName)[0].locked);

  const dispatch = useDispatch();

  const [location, setLocation] = useState(user?.location || personalQueueEntry?.location || '');
  const [comment, setComment] = useState(personalQueueEntry?.comment || '');
  const [help, setHelp] = useState(personalQueueEntry?.help || true);
  const [sendPersonalEntry] = useState(
    () => debounce((q: string, c: string, l: string, h: boolean): void => {
      dispatch(updatePersonalEntry(q, c, l, h));
    }, 750)
  );

  useEffect(() => {
    const newLocation = user?.location || personalQueueEntry?.location || '';
    const newComment = personalQueueEntry?.comment || '';
    const newHelp = personalQueueEntry?.help || true;

    if (user?.location && personalQueueEntry?.location && user?.location !== personalQueueEntry?.location) {
      dispatch(updatePersonalEntry(queueName, newComment, newLocation, newHelp));
    }

    setLocation(newLocation);
    setComment(newComment);
    setHelp(newHelp);

  }, [personalQueueEntry, user]);

  function changeLocation(event: any): void {
    if (user?.location) {
      return;
    }

    setLocation(event.target.value);
    if (personalQueueEntry !== null && event.target.value && comment) {
      sendPersonalEntry(queueName, comment, event.target.value, help);
    }
    else {
      sendPersonalEntry.cancel();
    }
  }

  function changeComment(event: any): void {
    setComment(event.target.value);
    if (personalQueueEntry !== null && location && event.target.value) {
      sendPersonalEntry(queueName, event.target.value, location, help);
    }
    else {
      sendPersonalEntry.cancel();
    }
  }

  function changeHelp(event: any): void {
    setHelp(event.target.value === 'help');
  }

  function enterQueue(event: any) {
    if (personalQueueEntry) {
      return;
    }

    if (!location || !comment) {
      return;
    }

    if (event.key === 'Enter' || event.button === 0) {
      dispatch(joinQueue(queueName, comment, location, help));
    }
  }

  function login() {
    localStorage.setItem('LastVisitedUrl', window.location.pathname);
    window.location.href = 'https://login.kth.se/login?service=http://queue.csc.kth.se/auth';
  }

  return (
    user
      ? <>
          <label htmlFor="location">Location:</label>
          <br />
          <div style={{backgroundColor: location === '' ? 'red' : 'inherit'}}>
            <input
              name="location"
              type="text"
              value={location}
              onChange={user?.location ? undefined : changeLocation}
              disabled={user?.location ? true : false}
              style={{width: '100%', borderRadius: 0}} />
            {
              location === ''
              ? <>
                  <br />
                  <em>Required</em>
                </>
              : null
            }
          </div>

          <br />

          <label htmlFor="comment">Comment:</label>
          <br />
          <div style={{backgroundColor: comment === '' ? 'red' : 'inherit'}}>
            <input
              name="comment"
              type="text"
              value={comment}
              onChange={changeComment}
              onKeyUp={enterQueue}
              style={{width: '100%', borderRadius: 0}} />
            {
              comment === ''
              ? <>
                  <br />
                  <em>Required</em>
                </>
              : null
            }
          </div>

          <br />

          {
            personalQueueEntry !== null
              ? null
              : <>
                  <div className="row text-center">
                    <div className="col-6">
                      <label htmlFor="help" style={{marginRight: '.5em' }}>Help</label>
                      <input
                        type="radio"
                        name="react-tips"
                        value="help"
                        checked={help}
                        onChange={changeHelp} />
                    </div>
                    <div className="col-6">
                      <label htmlFor="present" style={{marginRight: '.5em' }}>Present</label>
                      <input
                        type="radio"
                        name="react-tips"
                        value="present"
                        checked={!help}
                        onChange={changeHelp} />
                      </div>
                  </div>

                  <br />
                </>
          }

          {
            personalQueueEntry !== null
              ? <>
                {
                  personalQueueEntry.gettinghelp
                    ? null
                    : <div
                        className="col-12 text-center yellow clickable"
                        style={{lineHeight: '3em'}}
                        onClick={() => dispatch(recievingHelp(queueName, true))}>
                        <strong>Recieving help</strong>
                      </div>
                }
                  <div
                    className="col-12 text-center red clickable"
                    style={{lineHeight: '3em'}}
                    onClick={() => dispatch(leaveQueue(queueName))}>
                    <strong>Leave queue</strong>
                  </div>
                </>
              : !isLocked
                  ? <div
                      className="col-12 text-center blue clickable"
                      style={{lineHeight: '3em'}}
                      onClick={enterQueue}>
                      <strong>Join queue</strong>
                    </div>
                  : <div
                      className="col-12 text-center gray"
                      style={{lineHeight: '3em'}}
                      onClick={enterQueue}>
                      <strong><Lock /> Queue is locked</strong>
                    </div>
          }
        </>
      : <div
          className="col-12 text-center blue clickable"
          style={{lineHeight: '3em'}}
          onClick={login}>
          <strong>Login</strong>
        </div>
  );
};
