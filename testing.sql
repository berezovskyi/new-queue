\c queuesystem
insert into users (username, ugkthid, realname) VALUES ('antbac', 'ug2hhhh', 'Anton Backstrom');
insert into users (username, ugkthid, realname) VALUES ('robertwb', 'ug1aaaa', 'Robert Welin-Berger');
insert into users (username, ugkthid, realname) VALUES ('tester1', 'ugt1111', 'Testing mcTester');
insert into users (username, ugkthid, realname) VALUES ('tester2', 'ugt2222', 'Fighter mcFight');
insert into users (username, ugkthid, realname) VALUES ('tester3', 'ugt3333', 'Jumper mcJump');
insert into users (username, ugkthid, realname) VALUES ('tester4', 'ugt4444', 'Corona mcDeath');
insert into users (username, ugkthid, realname) VALUES ('tester5', 'ugt5555', 'Social mcDistancer');
INSERT INTO queues (name) VALUES ('test queue please ignore');
INSERT INTO queues (name) VALUES ('ADK');
INSERT INTO queues (name) VALUES ('INDA');
INSERT INTO queues (name) VALUES ('test1');
INSERT INTO queues (name) VALUES ('test2');
INSERT INTO queues (name) VALUES ('test3');
INSERT INTO queues (name) VALUES ('test4');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'robertwb' ), (select id from queues where name = 'INDA' ), '','');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'antbac' ), (select id from queues where name = 'INDA' ), '','');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'tester1' ), (select id from queues where name = 'INDA' ), '','');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'tester3' ), (select id from queues where name = 'INDA' ), '','');
INSERT INTO queue_entries (user_id, queue_id, location, usercomment) VALUES ((select id from users where username = 'tester5' ), (select id from queues where name = 'INDA' ), '','');
