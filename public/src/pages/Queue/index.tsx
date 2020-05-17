import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { GlobalStore } from '../../store';
import { useParams } from "react-router-dom";
import { subscribe, unsubscribe } from '../../actions/queueActions';
import { setTitle } from '../../actions/titleActions';
import Queue from '../../models/Queue';
import User from '../../models/User';
import EnterQueueViewComponent from './EnterQueue';
import QueueAdministratorOptionsViewComponent from './QueueAdministratorOptions';
import QueueEntryTableViewComponent from './QueueEntryTable';
import PageNotFound from '../NoMatch';
import SearchViewComponent from '../../viewcomponents/Search';
import { Lock } from '../../viewcomponents/FontAwesome';
import DingLing from '../../sounds/DingLing.mp3';

export default (): JSX.Element | null => {

  const { queueName } = useParams();

  const user = useSelector<GlobalStore, User | null>(store => store.user);
  const queue = useSelector<GlobalStore, Queue | null>(store => store.queues.filter(q => q.name === queueName)[0] || null);
  const queuesAreLoaded = useSelector<GlobalStore, boolean>(store => store.queues.length > 0);
  const playSounds = useSelector<GlobalStore, boolean>(store => store.playSounds);

  const [filter, setFilter] = useState('');
  const [previousQueueEntryCount, setPreviousQueueEntryCount] = useState(0);

  const dispatch = useDispatch();

  function updateTitle() {
    if (queue !== null && user !== null) {
      for (let i = 0; i < queue.queueEntries.length; i++) {
        if (queue.queueEntries[i].ugkthid === user.ugkthid) {
          dispatch(setTitle(`[${i+1}/${queue.queueEntries.length}] ${queue.name} | Stay A While 2`));
          return;
        }
      }
    }
  }
  updateTitle();

  useEffect(() => {
    if (!dispatch) {
      return;
    }

    if (queue !== null) {
      dispatch(subscribe(queue.name));

      return () => {
        dispatch(unsubscribe(queue.name));
      };
    }
  }, [queuesAreLoaded, queue, dispatch]);

  useEffect(() => {
    if (!updateTitle) {
      return;
    }

    updateTitle();
  }, [queue, updateTitle]);

  useEffect(() => {
    if (!queue) {
      return;
    }

    if (!user?.isTeacherIn(queue.name) && !user?.isAssistantIn(queue.name)) {
      return;
    }

    if (!queue.queueEntries) {
      setPreviousQueueEntryCount(0);
    }
    else {
      const newEntryNumber = queue.queueEntries.length;
      if (previousQueueEntryCount === 0 && newEntryNumber === 1 && playSounds) {
        new Audio(DingLing).play();
      }
      setPreviousQueueEntryCount(newEntryNumber);
    }
  }, [queue?.queueEntries]);

  return (
    !queuesAreLoaded
      ? null
      : queue === null
        ? <PageNotFound />
        : <div className="container col-10">
            <div className="row">
              {
                queue.locked
                  ? <h1 className="col-12 col-lg-3 text-danger">{queue.name} <Lock /></h1>
                  : <h1 className="col-12 col-lg-3">{queue.name}</h1>
              }
              <p className="col-12 col-lg-6">{queue.info}</p>
              <div className="col-12 col-lg-3">
                <SearchViewComponent filter={filter} setFilter={setFilter} />
              </div>
            </div>
            <div className="row" style={{marginTop: '5em'}}>
              <div className="col-12 col-lg-3">
                <EnterQueueViewComponent queueName={queue.name} />
                <QueueAdministratorOptionsViewComponent queue={queue} />
              </div>
              <div className="col-12 col-lg-9">
                <QueueEntryTableViewComponent
                  filter={filter}
                  queueEntries={queue.queueEntries}
                  queueName={queue.name} />
              </div>
            </div>
          </div>
  );
};
